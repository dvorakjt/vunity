import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { MeetingsService } from '../meetings/meetings.service';
import { MeetingStatus } from '../../constants/meeting-status';
import { Message } from '../../models/message.model';
import { ReplaySubject } from 'rxjs';
import { LocalPeer } from 'src/app/models/local-peer.model';
import { RemotePeerPartial } from 'src/app/models/remote-peer-partial.model';
import { RemotePeer } from 'src/app/models/remote-peer.model';
import { RemotePeerMap } from 'src/app/types/remote-peer-map.type';
import { PEER_CONNECTION_CONFIG } from 'src/app/constants/peer-connection';
import { DataChannelMessage } from 'src/app/types/data-channel-message.type';

declare var SockJS: any;
declare var Stomp: any;

@Injectable()
export class ActiveMeetingService {
    private websocketConnection?: WebSocket;
    private websocketStatus = new ReplaySubject<string>(1);

    public isHost = false;
    private authToken = '';
    public localPeer?:LocalPeer;
    private remotePeerPartials:RemotePeerPartial[] = [];
    public remotePeerList:RemotePeer[] = [];
    public remotePeersById:RemotePeerMap = {};
    public messages:Message[] = [];

    public meetingStatus: MeetingStatus = MeetingStatus.NotInMeeting;
    meetingStatusChanged = new EventEmitter<MeetingStatus>();

    constructor(private authService: AuthService, private http: HttpClient) {
    }

    authenticateAsGuest(meetingId:string, password:string) {
        if(this.meetingStatus === MeetingStatus.NotInMeeting) {
            this.updateMeetingStatus(MeetingStatus.Authenticating);
            this.http.post(`/api/meeting/join?meetingId=${meetingId}&password=${password}`, {}).subscribe({
                next: (responseData: any) => {
                    this.authToken = responseData.access_token;
                    this.updateMeetingStatus(MeetingStatus.AwaitingUsernameInput);
                },
                error: (e) => {
                    this.handleError(e);
                }
            });
        } else this.handleError(new Error("Already in meeting"));
    }

    authenticateAsHost(meetingId:string) {
        if(this.meetingStatus === MeetingStatus.NotInMeeting) {
            this.updateMeetingStatus(MeetingStatus.Authenticating);
            if (this.authService.access_token) {
                const headers = new HttpHeaders({
                    'Authorization': this.authService.getAuthorizationHeader()
                });
                const opts = { headers: headers };
                this.http.post('/api/users/host_token', { meetingId }, opts).subscribe({
                    next: (responseData: any) => {
                        if(this.authService.activeUser) {
                            this.isHost = true;
                            this.authToken = responseData.access_token;
                            this.createLocalPeer(this.authService.activeUser.name);
                            this.updateMeetingStatus(MeetingStatus.AwaitingMedia);
                        } else this.handleError(new Error("No active user."));
                    },
                    error: (e) => {
                        this.handleError(e);
                    }
                });
            } else {
                this.handleError(new Error("No access token."));
            }
        } else this.handleError(new Error("Already in meeting"));
    }

    public setLocalPeerUsername(username:string) {
        this.createLocalPeer(username);
        this.updateMeetingStatus(MeetingStatus.AwaitingMedia);
    }

    private createLocalPeer(username:string) {
        this.localPeer = new LocalPeer(username);
        this.localPeer.dataChannelEventEmitter.subscribe({
            next: (value:DataChannelMessage) => {
                this.broadCastMessage(value.messageType, value.message);
            }
        });
    }

    public getLocalMedia() {
        console.log(this.localPeer);
        if(this.localPeer) {
            this.localPeer.getMedia().then(() => {
                this.updateMeetingStatus(MeetingStatus.AwaitingMediaSettings);
            }).catch((e) => {
                this.handleError(e);
            });
        } else this.handleError(new Error("No local peer was created"));
    }

    public setLocalAudioEnabled(audioEnabled:boolean) {
        this.localPeer?.setAudioEnabled(audioEnabled);
    }

    public setLocalVideoEnabled(videoEnabled:boolean) {
        this.localPeer?.setVideoEnabled(videoEnabled);
    }

    public confirmMediaSettings() {
        this.updateMeetingStatus(MeetingStatus.ReadyToJoin);
        if(this.isHost) {
            this.open();
        } else this.join();
    }

    private join() {
        this.updateMeetingStatus(MeetingStatus.ConnectingToSignalingServer);
        this.checkAndEstablishWebSocketConnection();
        this.updateMeetingStatus(MeetingStatus.WaitingForHost);
        const joinData = {
            intent: 'join',
            username: this.localPeer?.username
        }
        this.sendOverWebSocket(joinData);
    }

    private open() {
        this.updateMeetingStatus(MeetingStatus.ConnectingToSignalingServer);
        this.checkAndEstablishWebSocketConnection();
        const openData = {
            intent: 'open',
            username: this.localPeer?.username
        }
        this.sendOverWebSocket(openData);
    }

    public leave() {
        this.sendOverWebSocket({
            intent: 'leave'
        });
        this.resetMeetingData();
    }

    public close() {
        this.sendOverWebSocket({
            intent: 'close'
        });
        this.resetMeetingData();
    }

    public resetMeetingData() {
    }

    //Handle Signaling messages

    private handleJoinOrOpenAsHost(data:any) {
        for (const participant of data.preexistingParticipants) {
            const {sessionId, username} = participant;
            const remotePeerPartial = new RemotePeerPartial(sessionId, username, new RTCPeerConnection(PEER_CONNECTION_CONFIG));
            this.remotePeerPartials.push(remotePeerPartial);
        }
        if (data.isOpen) {
            this.meetingStatusChanged.emit(MeetingStatus.InMeeting);
            this.openConnections();
        }
    }

    private openConnections() {
        if(this.localPeer && this.localPeer.stream) {
            for(const remotePeerPartial of this.remotePeerPartials) {
                const remotePeer = remotePeerPartial.openConnection(this.localPeer.stream);
                this.remotePeerList.push(remotePeer);
                this.remotePeersById[remotePeer.sessionId] = remotePeer;
                this.subscribeToRemotePeerEvents(remotePeer);
                remotePeer.createOffer();
            }
        }
    }

    private handleOffer(data:any) {
        if(this.localPeer && this.localPeer.stream) {
            const connection = new RTCPeerConnection(PEER_CONNECTION_CONFIG);
            const offer = new RTCSessionDescription(JSON.parse(data.offer));
            const initiatingPeerId = data.from;
            const initiatingPeerUsername = data.username;
            const remotePeer = RemotePeer.createRemoteConnectionFromOffer(initiatingPeerId, initiatingPeerUsername, connection, offer, this.localPeer.stream);
            this.remotePeerList.push(remotePeer);
            this.remotePeersById[remotePeer.sessionId] = remotePeer;
            this.subscribeToRemotePeerEvents(remotePeer);
            remotePeer.createAnswer();
        }
    }

    private subscribeToRemotePeerEvents(remotePeer:RemotePeer) {
        remotePeer.signalingEventEmitter.subscribe({
            next: (dto) => {
                if(dto) {
                    this.sendOverWebSocket(dto);
                }
            }
        });
        remotePeer.mediaStatusRequestEventEmitter.subscribe({
            next: () => {
                if(remotePeer.dataChannel && this.localPeer) {
                    const messageObject = {
                        messageType: 'mediaEnabledStatus',
                        message: {
                            audioEnabled : this.localPeer.audioEnabled,
                            videoEnabled : this.localPeer.videoEnabled
                        }
                    }
                    const messageString = JSON.stringify(messageObject);
                    remotePeer.dataChannel.send(messageString);
                }
            }
        });
        remotePeer.chatMessageEventEmitter.subscribe({
            next: (message) => {
                this.messages.push(message);
            }
        });
    }

    private handleAnswer(data:any) {
        const answer = new RTCSessionDescription(JSON.parse(data.answer));
        const remotePeerSessionId = data.from;
        const remotePeer = this.remotePeersById[remotePeerSessionId];
        if(remotePeer) {
            remotePeer.connection.setRemoteDescription(answer);
        }
    }

    private handleCandidate(data:any) {
        const candidate = new RTCIceCandidate(JSON.parse(data.candidate));
        const remotePeerSessionId = data.from;
        const remotePeer = this.remotePeersById[remotePeerSessionId]
        if(remotePeer) {
            remotePeer.connection.addIceCandidate(candidate);
        }
    }

    public handlePeerDeparture(remotePeerId:string) {
        this.remotePeerList = this.remotePeerList.filter((peer) => {
            return peer.sessionId !== remotePeerId;
        });
        delete this.remotePeersById[remotePeerId];
    }

    public handleMeetingClosure() {
        this.resetMeetingData();
    }

    private updateMeetingStatus(newStatus:MeetingStatus) {
        this.meetingStatus = newStatus;
        this.meetingStatusChanged.emit(newStatus);
    }

    private checkAndEstablishWebSocketConnection() {
        if (!this.websocketConnection || this.websocketConnection.readyState === WebSocket.CLOSING || this.websocketConnection.readyState === WebSocket.CLOSED) {
            this.websocketStatus.next('loading');
            this.websocketConnection = new WebSocket('ws://localhost:8080/socket'); //websocket should be reopened if closed
            this.websocketConnection.onopen = () => {
                this.websocketStatus.next('open');
                this.websocketConnection?.addEventListener('message', (message) => {
                    const data = JSON.parse(message.data);
                    console.log(data);
                    if (data.event === 'joined' || data.event === 'openedAsHost') {
                        this.handleJoinOrOpenAsHost(data);
                    } else if (data.event === 'opened') {
                        this.updateMeetingStatus(MeetingStatus.InMeeting);
                        this.openConnections();
                    } else if (data.event === 'offer') {
                        this.handleOffer(data);
                    } else if (data.event === 'answer') {
                        this.handleAnswer(data);
                    } else if (data.event === 'candidate') {
                        this.handleCandidate(data);
                    } else if (data.event === 'peerDeparture') {
                        console.log("peer departing");
                        this.handlePeerDeparture(data.from);
                    } else if (data.event === 'closed') {
                        this.handleMeetingClosure();
                    }
                });
            }
            this.websocketConnection.onerror = (e) => {
                this.handleError(e);
            }
        }
    }

    private sendOverWebSocket(dto: any) {
        this.websocketStatus.subscribe({
            next: (status) => {
                if (status === 'open') {
                    const authData = {
                        isHost: this.isHost,
                        meetingAccessToken: this.authToken
                    }
                    Object.assign(dto, authData);
                    this.websocketConnection?.send(JSON.stringify(dto));
                }
            }
        })
    }

    //send data over data channel

    public broadCastMessage(messageType:string, message:any) {
        if (this.meetingStatus === MeetingStatus.InMeeting) {
            if(messageType === 'chat') {
                const m = new Message(message, "me");
                this.messages.push(m);
            }
            const broadcastData = JSON.stringify({
                messageType,
                message
            });
            for(const remotePeer of this.remotePeerList) {
                if (remotePeer.dataChannel && remotePeer.dataChannel.readyState == 'open') {
                    remotePeer.dataChannel.send(broadcastData);
                }
            }
        }
    }

    private handleError(e:any) {
        console.log(e);
    }
}
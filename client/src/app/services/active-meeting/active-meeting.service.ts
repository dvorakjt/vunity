import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { MeetingStatus } from '../../constants/meeting-status';
import { Message } from '../../models/message.model';
import { ReplaySubject } from 'rxjs';
import { LocalPeer } from 'src/app/models/local-peer.model';
import { RemotePeerPartial } from 'src/app/models/remote-peer-partial.model';
import { RemotePeer } from 'src/app/models/remote-peer.model';
import { RemotePeerMap } from 'src/app/types/remote-peer-map.type';
import { PEER_CONNECTION_CONFIG } from 'src/app/constants/peer-connection';
import { DataChannelMessage } from 'src/app/types/data-channel-message.type';
import { Peer } from 'src/app/models/peer.model';
import { ScreenViewer } from 'src/app/models/screen-viewer.model';
import { ScreenViewerMap } from 'src/app/types/screen-viewer-map.type';
import { ScreenSharingPeer } from 'src/app/models/screen-sharing-peer.model';
import { LocalScreenSharingPeer } from 'src/app/models/local-screen-sharing-peer.model';
import { GuestAuthError } from './errors/guest-auth-error';
import { HostAuthError } from './errors/host-auth-error';

declare var SockJS: any;
declare var Stomp: any;

@Injectable({providedIn: 'root'})
export class ActiveMeetingService {
    private websocketConnection?: WebSocket;
    private websocketStatus = new ReplaySubject<string>(1);

    public isHost = false;
    private authToken = '';
    public localPeer?:LocalPeer;
    private remotePeerPartials:RemotePeerPartial[] = [];
    public remotePeerList:RemotePeer[] = [];
    public remotePeersById:RemotePeerMap = {};

    public isSharingScreen = false;
    public screenSharingStream?:MediaStream;
    public screenSharingPeer?:Peer;
    public screenViewersById:ScreenViewerMap = {};

    public speakingPeer?:Peer;

    public messages:Message[] = [];
    public newChatMessageReceived = new EventEmitter<void>();

    public meetingStatus: MeetingStatus = MeetingStatus.NotInMeeting;
    public meetingStatusChanged = new EventEmitter<MeetingStatus>(); 
    public errorEmitter = new EventEmitter<Error>();

    public remotePeerJoinedOrLeft = new EventEmitter<void>();

    constructor(private authService: AuthService, private http: HttpClient) {
    }

    authenticateAsGuest(meetingId:string, password:string, recaptchaToken:string) {
        if(this.meetingStatus === MeetingStatus.NotInMeeting) {
            this.http.post('/api/meeting/join', {
                meetingId,
                password,
                recaptchaToken
            }).subscribe({
                next: (responseData: any) => {
                    this.authToken = responseData.access_token;
                    this.updateMeetingStatus(MeetingStatus.AwaitingUsernameInput);
                },
                error: (e) => {
                    this.handleError(new GuestAuthError('Failed to join meeting. Please check the id and password.'));
                }
            });
        } else this.handleError(new GuestAuthError('Already in a meeting.'));
    }

    authenticateAsHost(meetingId:string) {
        if(this.meetingStatus === MeetingStatus.NotInMeeting) {
            this.http.post('/api/users/host_token', { meetingId }).subscribe({
                next: (responseData: any) => {
                    if(this.authService.activeUser) {
                        this.isHost = true;
                        this.authToken = responseData.access_token;
                        this.createLocalPeer(this.authService.activeUser.name);
                        this.updateMeetingStatus(MeetingStatus.AwaitingMedia);
                        this.getLocalMedia();
                    } else this.handleError(new HostAuthError("No active user."));
                },
                error: (e) => {
                    this.handleError(new HostAuthError('Insufficicent permissions.'));
                }
            });
        } else this.handleError(new HostAuthError("Already in meeting"));
    }

    public setLocalPeerUsername(username:string) {
        this.createLocalPeer(username);
        this.updateMeetingStatus(MeetingStatus.AwaitingMedia);
        this.getLocalMedia();
    }

    private createLocalPeer(username:string) {
        this.localPeer = new LocalPeer(username);
        this.localPeer.dataChannelEventEmitter.subscribe({
            next: (value:DataChannelMessage) => {
                console.log(value);
                this.broadCastMessage(value.messageType, value.message);
            },
            error: (e) => {
                console.log(e);
            },
            complete: () => {
                console.log("complete");
            }
        });
        //speaking peer defaults to localPeer
        this.speakingPeer = this.localPeer;

        // DO NOT RESET SPEAKING PEER TO LOCAL PEER AFTER OTHER PEERS HAVE JOINED!
        // this.localPeer.speechEventEmitter.subscribe({
        //     next: (isSpeaking) => {
        //         if(isSpeaking) this.speakingPeer = this.localPeer;
        //     }
        // });
    }

    public getLocalMedia() {
        if(this.localPeer) {
            this.localPeer.getMedia().then(() => {
                //the user may have cancelled their attempt to join the meeting, so only update the meeting status if 
                //it is still AwaitingMedia
                if(this.meetingStatus == MeetingStatus.AwaitingMedia) {
                    this.updateMeetingStatus(MeetingStatus.AwaitingMediaSettings);
                }
            }).catch((e) => {
                this.handleError(e);
                this.resetMeetingData();
            });
        } else {
            this.handleError(new Error("No local peer was created"));
            this.resetMeetingData();
        }
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

    public shareScreen() {
        this.sendOverWebSocket({intent: 'shareScreen'});
    }

    public stopScreenShare() {
        if(this.screenSharingStream && this.isSharingScreen) {
            this.sendOverWebSocket({intent: 'stopSharingScreen'});
            this.screenSharingPeer = undefined;
            for(const track of this.screenSharingStream?.getTracks()) {
                track.stop();
            }
            for(const key in this.screenViewersById) {
                const viewer = this.screenViewersById[key];
                viewer.connection.close();
            }
            this.screenSharingStream = undefined;
            this.screenViewersById = {};
            this.isSharingScreen = false;
        }
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
        for(const remotePeer of this.remotePeerList) {
            remotePeer.connection.close();
        }
        for(const screenViewerSessionId in this.screenViewersById) {
            const screenViewer = this.screenViewersById[screenViewerSessionId];
            screenViewer.connection.close();
        }
        if(this.screenSharingPeer && "connection" in this.screenSharingPeer) {
            const screenSharingPeer = this.screenSharingPeer as ScreenSharingPeer;
            screenSharingPeer.connection.close();
        }
        this.localPeer?.releaseMedia();
        if(this.screenSharingStream) {
            for(const track of this.screenSharingStream.getTracks()) {
                track.stop();
            }
        }
        this.websocketConnection?.close();
        this.isHost = false;
        this.authToken = '';
        this.localPeer = undefined;
        this.remotePeerPartials = [];
        this.remotePeerList = [];
        this.remotePeersById = {};

        this.isSharingScreen = false;
        
        this.screenSharingStream = undefined;
        this.screenSharingPeer = undefined;
        this.screenViewersById = {};

        this.speakingPeer = undefined;

        this.messages = [];

        this.updateMeetingStatus(MeetingStatus.NotInMeeting);
    }

    //Handle Signaling messages

    private handleJoinOrOpenAsHost(data:any) {
        for (const participant of data.preexistingParticipants) {
            const {sessionId, username} = participant;
            const remotePeerPartial = new RemotePeerPartial(sessionId, username, new RTCPeerConnection(PEER_CONNECTION_CONFIG));
            this.remotePeerPartials.push(remotePeerPartial);
        }
        //make sure that the meeting status is not NotInMeeting, it should have advance beyond this point.
        //if it is NotInMeeting, that likely means that the user cancelled joining or opening it.
        if (data.isOpen && this.meetingStatus != MeetingStatus.NotInMeeting) {
            this.updateMeetingStatus(MeetingStatus.InMeeting);
            this.openConnections();
        }
    }

    private openConnections() {
        if(this.localPeer && this.localPeer.stream) {
            for(const remotePeerPartial of this.remotePeerPartials) {
                const remotePeer = remotePeerPartial.openConnection(this.localPeer.stream);
                this.remotePeerList.push(remotePeer);
                this.remotePeersById[remotePeer.sessionId] = remotePeer;
                if(this.speakingPeer == this.localPeer) this.speakingPeer = remotePeer;
                this.remotePeerJoinedOrLeft.emit();
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
            if(this.speakingPeer == this.localPeer) this.speakingPeer = remotePeer;
            this.remotePeerJoinedOrLeft.emit();
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
                this.newChatMessageReceived.emit();
            }
        });
        remotePeer.speechEventEmitter.subscribe({
            next: (isSpeaking) => {
                if(isSpeaking) {
                    this.speakingPeer = remotePeer
                }
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

    private async handleScreenShareSucceeded(data:any) {
        try {
            this.screenSharingStream = await navigator.mediaDevices.getDisplayMedia({audio: true, video: true});
            this.isSharingScreen = true;
            this.screenSharingStream.addEventListener('inactive', () => {
                this.sendOverWebSocket({intent: 'stopSharingScreen'});
                this.screenSharingPeer = undefined;
                this.screenSharingStream = undefined;
                for(const key in this.screenViewersById) {
                    const viewer = this.screenViewersById[key];
                    viewer.connection.close();
                }
                this.screenViewersById = {};
                this.isSharingScreen = false;
            });
            this.screenSharingPeer = new LocalScreenSharingPeer('My');
            this.screenSharingPeer.stream = this.screenSharingStream;
            data.peerIds.forEach((peerId:string) => {
                this.createScreenShareOffer(peerId);
            });
        } catch(e) {
            this.handleError(new Error('screen share error'));
            this.sendOverWebSocket({intent: 'stopSharingScreen'});
        }
    }

    private createScreenShareOffer(peerId:string) {

        const viewer = new ScreenViewer(peerId, new RTCPeerConnection(PEER_CONNECTION_CONFIG));
        this.screenViewersById[peerId] = viewer;

        viewer.connection.onicecandidate = (event) => {
            if (event.candidate) {
                const candidate = JSON.stringify(new RTCIceCandidate(event.candidate as RTCIceCandidateInit).toJSON());
                const signalingEventObject = {
                    intent: 'candidate-screenSharer',
                    to: viewer.sessionId,
                    candidate
                }
                this.sendOverWebSocket(signalingEventObject);
            }
        }

        if(this.screenSharingStream) {
            for(const track of this.screenSharingStream?.getTracks()) {
                viewer.connection.addTrack(track, this.screenSharingStream);
            }
        }

        viewer.connection.createOffer().then((offer) => {
            viewer.connection.setLocalDescription(offer);
            const offerDTO = {
                intent: 'offer-screenSharer',
                to: viewer.sessionId,
                offer: JSON.stringify(new RTCSessionDescription(offer).toJSON()),
            }
            this.sendOverWebSocket(offerDTO);
        }).catch((e) => {
            this.handleError(e);
        });
    }

    private handleScreenShareOffer(data:any) {
        const screenSharingPeer = new ScreenSharingPeer(data.from, data.username + "'s", new RTCPeerConnection(PEER_CONNECTION_CONFIG));

        const offer = new RTCSessionDescription(JSON.parse(data.offer));

        screenSharingPeer.connection.setRemoteDescription(offer);
        
        screenSharingPeer.connection.onicecandidate = (event) => {
            if (event.candidate) {
                const candidate = JSON.stringify(new RTCIceCandidate(event.candidate as RTCIceCandidateInit).toJSON());
                const signalingEventObject = {
                    intent: 'candidate-screenViewer',
                    to: data.from,
                    candidate
                }
                this.sendOverWebSocket(signalingEventObject);
            }
        }

        screenSharingPeer.connection.addEventListener('track', async (event) => {
            const [remoteStream] = event.streams;
            screenSharingPeer.stream = remoteStream;
        });

        screenSharingPeer.connection.createAnswer().then(answer => {
            screenSharingPeer.connection.setLocalDescription(answer);
            const signalingEventObject = {
                intent: 'answer-screenViewer',
                to: data.from,
                answer: JSON.stringify(new RTCSessionDescription(answer).toJSON())
            }
            this.sendOverWebSocket(signalingEventObject);
        }).catch(e => {
            this.handleError(e);
        });

        this.screenSharingPeer = screenSharingPeer;
    }

    private handleScreenShareCandidate(data:any) {
        const candidate = new RTCIceCandidate(JSON.parse(data.candidate));
        if(this.screenSharingPeer) {
            (this.screenSharingPeer as ScreenSharingPeer).connection.addIceCandidate(candidate);
        }
    }

    private handleScreenViewerAnswer(data:any) {
        const answer = new RTCSessionDescription(JSON.parse(data.answer));
        const screenViewerId = data.from;
        const screenViewer = this.screenViewersById[screenViewerId];
        if(screenViewer) {
            screenViewer.connection.setRemoteDescription(answer);
        }
    }

    private handleScreenViewerCandidate(data:any) {
        const candidate = new RTCIceCandidate(JSON.parse(data.candidate));
        const screenViewerId = data.from;
        const screenViewer = this.screenViewersById[screenViewerId];
        if(screenViewer) {
            screenViewer.connection.addIceCandidate(candidate);
        }
    }

    private handleNewScreenViewer(data:any) {
        this.createScreenShareOffer(data.peerId);
    }

    private handleScreenShareFailed(data:any) {
        console.log(data);
    }

    private handleScreenShareStopped() {
        this.screenSharingPeer = undefined;
    }

    private handlePeerDeparture(remotePeerId:string) {
        this.remotePeerList = this.remotePeerList.filter((peer) => {
            return peer.sessionId !== remotePeerId;
        });
        delete this.remotePeersById[remotePeerId];
        this.remotePeerJoinedOrLeft.emit();
    }

    private handleMeetingClosure() {
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
                    } else if (data.event === 'screenShareSucceeded') {
                        this.handleScreenShareSucceeded(data);
                    } else if (data.event === 'screenShareFailed') {
                        this.handleScreenShareFailed(data);
                    } else if (data.event === 'offer-screenSharer') {
                        this.handleScreenShareOffer(data);
                    } else if (data.event === 'answer-screenViewer') {
                        this.handleScreenViewerAnswer(data);
                    } else if (data.event === 'candidate-screenSharer') {
                        this.handleScreenShareCandidate(data);
                    } else if (data.event === 'candidate-screenViewer') {
                        this.handleScreenViewerCandidate(data);
                    } else if (data.event === 'newScreenViewer') {
                        this.handleNewScreenViewer(data);
                    } else if (data.event === 'screenShareStopped') {
                        this.handleScreenShareStopped();
                    } else if (data.event === 'peerDeparture') {
                        this.handlePeerDeparture(data.from);
                    } else if (data.event === 'closed') {
                        this.handleMeetingClosure();
                    }
                });
            }
            this.websocketConnection.onerror = (e) => {
                this.handleError(new Error('websocket error'));
            }
        }
    }

    private sendOverWebSocket(dto: any) {
        const authData = {
            isHost: this.isHost,
            meetingAccessToken: this.authToken
        }
        Object.assign(dto, authData);
        if(this.websocketConnection && this.websocketConnection.readyState === WebSocket.OPEN) {
            this.websocketConnection.send(JSON.stringify(dto));
        } else if(this.websocketConnection && this.websocketConnection.readyState === WebSocket.CONNECTING) {
            this.websocketConnection.addEventListener('open', () => {
                this.websocketConnection?.send(JSON.stringify(dto));
            });
        } else this.handleError(new Error("No websocket connection exists or the connection is closing."));
    }

    //send data over data channel

    public broadCastMessage(messageType:string, message:any) {
        console.log(this.meetingStatus);
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
                console.log(remotePeer);
                console.log(remotePeer.dataChannel);
                console.log(remotePeer.dataChannel?.readyState);
                if (remotePeer.dataChannel && remotePeer.dataChannel.readyState == 'open') {
                    remotePeer.dataChannel.send(broadcastData);
                }
            }
        }
    }

    private handleError(e:Error) {
        console.log(e);
        this.errorEmitter.emit(e);
    }
}
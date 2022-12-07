import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { MeetingsService } from '../meetings/meetings.service';
import { MeetingStatus } from './meeting-status';
import { Message } from '../../models/message.model';
import { ReplaySubject } from 'rxjs';
import { peerStreamData } from '../../models/peer-stream-data';

//probably need ws to trigger some sort of observable, and to restart when closed
//this service should probably be split into two separate services

// Declare SockJS and Stomp
declare var SockJS: any;
declare var Stomp: any;

type peer = {
    username:string;
    connection:RTCPeerConnection;
}

type connectionData = {
    dataChannel:RTCDataChannel;
    connection:RTCPeerConnection;
    remoteStream?:MediaStream,
    username:string;
    audioEnabled:boolean;
    videoEnabled:boolean;
}

const peerConnectionConfig: RTCConfiguration = {
    iceServers: [{
        urls: "stun:stun2.1.google.com:19302"
    }]
};

const mediaConstraints = {
    video: true, audio: true
};

//need onLeave and onClose methods

@Injectable()
export class SignalingService {
    public  isHost = false;
    public username = '';

    private websocketConnection?: WebSocket;
    private websocketStatus = new ReplaySubject<string>(1);
    private currentMeetingToken = '';
    private initiatedRTCPeerConnections = {};
    private establishedRTCPeerConnections = {};

    public localStream?: MediaStream;
    public peerStreams: MediaStream[] = [];
    public audioEnabled = true;
    public videoEnabled = true;

    public meetingStatus: MeetingStatus = MeetingStatus.NotInMeeting;

    public messages: Message[] = []; //this will need to be an array of message objects which includes a from field. meeting participants should have usernames as fields (both in frontend & backend)

    meetingStatusChanged = new EventEmitter<MeetingStatus>();
    receivedNewMessage = new EventEmitter<void>();
    receivedNewStream = new EventEmitter<void>();
    localAudioToggled = new EventEmitter<boolean>();
    localVideoToggled = new EventEmitter<boolean>();
    remoteAudioToggled = new EventEmitter<{id:string; status:boolean}>();
    remoteVideoToggled = new EventEmitter<{id:string; status:boolean}>();

    constructor(private authService: AuthService, private meetingService: MeetingsService, private http: HttpClient) {
        this.checkAndEstablishWebSocketConnection();
    }

    private checkAndEstablishWebSocketConnection() {
        if (this.websocketConnection) {
            if (this.websocketConnection.readyState === WebSocket.CLOSING || this.websocketConnection.readyState === WebSocket.CLOSING) {
                this.establishWebSocketConnection();
            }
        } else {
            this.establishWebSocketConnection();
        }
    }

    //data going to the server can have an 'intent', data coming from the server can have an 'event'

    private establishWebSocketConnection() {
        this.websocketStatus.next('loading');
        this.websocketConnection = new WebSocket('ws://localhost:8080/socket'); //websocket should be reopened if closed
        this.websocketConnection.onopen = () => {
            this.websocketStatus.next('open');
            this.websocketConnection?.addEventListener('message', (message) => {
                const data = JSON.parse(message.data);
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
                }
            });
        }
        this.websocketConnection.onerror = (error) => {
            console.log(error);
        }
    }

    private sendOverWebSocket(dto: any) {
        this.websocketStatus.subscribe({
            next: (status) => {
                if (status === 'open') {
                    const authData = {
                        isHost: this.isHost,
                        meetingAccessToken: this.currentMeetingToken
                    }
                    Object.assign(dto, authData);
                    this.websocketConnection?.send(JSON.stringify(dto));
                }
            }
        })
    }

    private updateMeetingStatus(newStatus:MeetingStatus) {
        this.meetingStatus = newStatus;
        this.meetingStatusChanged.emit(this.meetingStatus);
    }

    private handleJoinOrOpenAsHost(data: any) { //data is going to become a specific type in future version
        for (const participant of data.preexistingParticipants) {
            const {sessionId, username} = participant;
            const newPeerConnection = {
                [sessionId]: {
                    username,
                    connection : new RTCPeerConnection(peerConnectionConfig)
                }
            }
            Object.assign(this.initiatedRTCPeerConnections, newPeerConnection);
        }
        if (data.isOpen) {
            this.updateMeetingStatus(MeetingStatus.InMeeting);
            this.openConnections();
        }
    }

    private openConnections() {
        for (const sessionId in this.initiatedRTCPeerConnections) {
            const {username, connection} = this.initiatedRTCPeerConnections[sessionId as keyof typeof this.initiatedRTCPeerConnections] as peer;
            const dataChannel = connection.createDataChannel('dataChannel-' + sessionId);
            this.localStream?.getTracks().forEach(track => {
                if (this.localStream) connection.addTrack(track, this.localStream);
            });
            dataChannel.onmessage = (messageEvent: MessageEvent) => {
                const data = JSON.parse(messageEvent.data);
                if(data.messageType === 'chat') {
                    const message = new Message(data.message, username);
                    this.messages.push(message);
                    this.receivedNewMessage.emit();
                } else if(data.messageType === 'microphoneToggle') {
                    this.remoteAudioToggled.emit({
                        id: sessionId,
                        status: data.message === 'true'
                    });
                } else if(data.messageType === 'videoToggle') {
                    this.remoteVideoToggled.emit({
                        id: sessionId,
                        status: data.message === 'true'
                    });
                } else if(data.messageType === 'requestMediaEnabledStatus') {
                    this.sendMediaEnabledStatus(dataChannel);
                } else if(data.messageType === 'mediaEnabledStatus') {
                    const {audioEnabled, videoEnabled} = data.message;
                    this.remoteAudioToggled.emit({
                        id: sessionId,
                        status: audioEnabled
                    });
                    this.remoteVideoToggled.emit({
                        id: sessionId,
                        status: videoEnabled
                    });
                }
            }
           
            const newEstablishedConnection = {
                [sessionId]: {
                    dataChannel,
                    connection,
                    remoteStream: undefined,
                    username,
                    audioEnabled: true,
                    videoEnabled: true
                }
            }

            Object.assign(this.establishedRTCPeerConnections, newEstablishedConnection);

            dataChannel.onopen = () => {
                this.requestMediaEnabledStatus(this.establishedRTCPeerConnections[sessionId as keyof typeof this.establishedRTCPeerConnections]);
            }

            connection.addEventListener('track', async (event) => {
                const [remoteStream] = event.streams;
                const connectionData = this.establishedRTCPeerConnections[sessionId as keyof typeof this.establishedRTCPeerConnections];
                (connectionData['remoteStream'] as any) = remoteStream;
                //check whether media tracks are enabled
                this.receivedNewStream.emit();
            });

            connection.createOffer().then((offer) => {
                connection.setLocalDescription(offer);
                this.websocketStatus.subscribe({
                    next: (status) => {
                        if (status === 'open') {
                            const dto = {
                                intent: 'offer',
                                to: sessionId,
                                offer: JSON.stringify(new RTCSessionDescription(offer).toJSON()),
                                username: this.username
                            }
                            this.sendOverWebSocket(dto);
                        }
                    }
                })
            }).catch((e) => {
                console.log(e);
            });
            connection.onicecandidate = this.onIceCandidate(sessionId);
        }
        this.initiatedRTCPeerConnections = {};
    }

    private handleOffer(data: any) {
        const connection = new RTCPeerConnection(peerConnectionConfig);
        const offer = new RTCSessionDescription(JSON.parse(data.offer));
        const initiatingPeerId = data.from;
        const initiatingPeerUsername = data.username;
        connection.onicecandidate = this.onIceCandidate(initiatingPeerId);
        connection.setRemoteDescription(offer);
        const newEstablishedConnection = {
            [initiatingPeerId]: {
                connection,
                dataChannel: undefined,
                remoteStream: undefined,
                username: initiatingPeerUsername,
                audioEnabled: true,
                videoEnabled: true
            }
        }
        Object.assign(this.establishedRTCPeerConnections, newEstablishedConnection);
        connection.ondatachannel = (event: RTCDataChannelEvent) => {
            const connectionData = this.establishedRTCPeerConnections[initiatingPeerId as keyof typeof this.establishedRTCPeerConnections] as any;
            connectionData.dataChannel = event.channel;
            const channel = (this.establishedRTCPeerConnections[initiatingPeerId as keyof typeof this.establishedRTCPeerConnections] as any).dataChannel;
            channel.onmessage = (messageEvent: MessageEvent) => {
                const data = JSON.parse(messageEvent.data);
                if(data.messageType === 'chat') {
                    const message = new Message(data.message, initiatingPeerUsername);
                    this.messages.push(message);
                    this.receivedNewMessage.emit();
                } else if(data.messageType === 'microphoneToggle') {
                    this.remoteAudioToggled.emit({
                        id: initiatingPeerId,
                        status: data.message === 'true'
                    });
                } else if(data.messageType === 'videoToggle') {
                    this.remoteVideoToggled.emit({
                        id: initiatingPeerId,
                        status: data.message === 'true'
                    })
                } else if(data.messageType === 'requestMediaEnabledStatus') {
                    this.sendMediaEnabledStatus(channel);
                } else if(data.messageType === 'mediaEnabledStatus') {
                    const {audioEnabled, videoEnabled} = data.message;
                    this.remoteAudioToggled.emit({
                        id: initiatingPeerId,
                        status: audioEnabled
                    });
                    this.remoteVideoToggled.emit({
                        id: initiatingPeerId,
                        status: videoEnabled
                    });
                }
            }
            this.requestMediaEnabledStatus(connectionData);
        }

        this.localStream?.getTracks().forEach(track => {
            if (this.localStream) connection.addTrack(track, this.localStream);
        });

        connection.addEventListener('track', async (event) => {
            const [remoteStream] = event.streams;
            const connectionData = this.establishedRTCPeerConnections[initiatingPeerId as keyof typeof this.establishedRTCPeerConnections];
            (connectionData['remoteStream'] as any) = remoteStream;
            this.receivedNewStream.emit();
        });

        connection.createAnswer().then(answer => {
            connection.setLocalDescription(answer);
            const dto = {
                intent: 'answer',
                to: initiatingPeerId,
                answer: JSON.stringify(new RTCSessionDescription(answer).toJSON())
            }
            this.sendOverWebSocket(dto);
        }).catch(e => {
            console.log(e);
        })
    }

    private requestMediaEnabledStatus(connectionData:connectionData) {
        const messageObject = {
            messageType: 'requestMediaEnabledStatus',
            message: ''
        }
        const messageString = JSON.stringify(messageObject);
        connectionData.dataChannel.send(messageString);
    }

    private sendMediaEnabledStatus(dataChannel:RTCDataChannel) {
        const messageObject = {
            messageType: 'mediaEnabledStatus',
            message: {
                audioEnabled : this.audioEnabled,
                videoEnabled : this.videoEnabled
            }
        }
        const messageString = JSON.stringify(messageObject);
        dataChannel.send(messageString);
    }

    private onIceCandidate(toSessionId: string) {
        return (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                const candidate = JSON.stringify(new RTCIceCandidate(event.candidate as RTCIceCandidateInit).toJSON());
                const dto = {
                    intent: 'candidate',
                    to: toSessionId,
                    candidate
                }
                this.sendOverWebSocket(dto);
            }
        }
    }

    private handleAnswer(data: any) {
        const answer = new RTCSessionDescription(JSON.parse(data.answer));
        const initiatingPeerId = data.from;
        const connection: RTCPeerConnection = this.establishedRTCPeerConnections[initiatingPeerId as keyof typeof this.establishedRTCPeerConnections]['connection'];
        connection.setRemoteDescription(answer);
    }

    private handleCandidate(data: any) {
        const candidate = new RTCIceCandidate(JSON.parse(data.candidate));
        const initiatingPeerId = data.from;
        const connection: RTCPeerConnection = this.establishedRTCPeerConnections[initiatingPeerId as keyof typeof this.establishedRTCPeerConnections]['connection'];
        connection.addIceCandidate(candidate);
    }

    public authenticateAsGuest(meetingId:string, password:string) {
        this.updateMeetingStatus(MeetingStatus.Authenticating);
        this.http.post(`/api/meeting/join?meetingId=${meetingId}&password=${password}`, {}).subscribe({
            next: (responseData: any) => {
                this.currentMeetingToken = responseData.access_token;
                this.updateMeetingStatus(MeetingStatus.AwaitingUsernameInput);
            },
            error: (_error) => {
                this.updateMeetingStatus(MeetingStatus.Error);
            }
        });
    }

    public setUsername(username:string) {
        this.username = username;
        this.updateMeetingStatus(MeetingStatus.AwaitingMedia);
    }

    public getMedia() {
        navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then((stream: MediaStream) => {
                this.localStream = stream;
                this.updateMeetingStatus(MeetingStatus.AwaitingMediaSettings);
            })
            .catch((error) => {
                this.updateMeetingStatus(MeetingStatus.Error);
            });
    }

    public confirmMediaSettings() {
        this.updateMeetingStatus(MeetingStatus.ReadyToJoin);
        if(this.isHost) {
            this.openMeeting();
        } else this.joinMeeting();
    }

    public joinMeeting() {
        this.updateMeetingStatus(MeetingStatus.ConnectingToSignalingServer);
        this.checkAndEstablishWebSocketConnection();
        this.updateMeetingStatus(MeetingStatus.WaitingForHost);
        const joinData = {
            intent: 'join',
            username: this.username
        }
        this.sendOverWebSocket(joinData);
    }

    public authenticateAsHost(meetingId:string) {
        this.updateMeetingStatus(MeetingStatus.Authenticating);
        if (this.authService.access_token) {
            const headers = new HttpHeaders({
                'Authorization': this.authService.getAuthorizationHeader()
            });
            const opts = { headers: headers };
            this.http.post('/api/users/host_token', { meetingId }, opts).subscribe({
                next: (responseData: any) => {
                    this.isHost = true;
                    this.currentMeetingToken = responseData.access_token;
                    if(this.authService.activeUser) this.username = this.authService.activeUser.name;
                    this.updateMeetingStatus(MeetingStatus.AwaitingMediaSettings);
                },
                error: (responseData:any) => {
                    this.updateMeetingStatus(MeetingStatus.Error);
                }
            });
        } else {
            this.updateMeetingStatus(MeetingStatus.Error);
        }
    } 

    public openMeeting() {
        this.updateMeetingStatus(MeetingStatus.ConnectingToSignalingServer);
        const openData = {
            intent: 'open',
            username: this.username
        }
        this.sendOverWebSocket(openData);
    }

    public broadCastMessage(messageType:string, message: string) {
        if (this.meetingStatus === MeetingStatus.InMeeting) {
            if(messageType === 'chat') {
                const m = new Message(message, "me");
                this.messages.push(m);
                this.receivedNewMessage.emit();
            }
            for (let sessionId in this.establishedRTCPeerConnections) {
                const broadcastData = JSON.stringify({
                    messageType,
                    message
                });
                const peer: any = this.establishedRTCPeerConnections[sessionId as keyof typeof this.establishedRTCPeerConnections];
                if (peer.dataChannel) {
                    const dataChannel = peer.dataChannel as RTCDataChannel;
                    if (dataChannel.readyState == 'open') {
                        dataChannel.send(broadcastData);
                    }
                }
            }
        }
    }

    public getMessages() {
        return this.messages.slice();
    }

    public getPeers() {
        const peers:peerStreamData[] = [];
        for (let sessionId in this.establishedRTCPeerConnections) {
            const peerConnection: any = this.establishedRTCPeerConnections[sessionId as keyof typeof this.establishedRTCPeerConnections];
            if (peerConnection.remoteStream) {
                const peer:peerStreamData = {
                    username: peerConnection.username,
                    stream: peerConnection.remoteStream,
                    audioEnabled: peerConnection.audioEnabled,
                    videoEnabled: peerConnection.videoEnabled,
                    id: sessionId
                }
                peers.push(peer);
            }
        }
        return peers;
    }

    public setMicrophoneEnabled(isEnabled:boolean) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = isEnabled;
            });
            this.audioEnabled = isEnabled;
            this.localAudioToggled.emit(this.audioEnabled);
            this.broadCastMessage('microphoneToggle', `${this.audioEnabled}`);
        }
    }

    public setVideoEnabled(isEnabled:boolean) {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => {
                track.enabled = isEnabled;
            });
            this.videoEnabled = isEnabled;
            this.localVideoToggled.emit(this.videoEnabled);
            this.broadCastMessage('videoToggle', `${this.videoEnabled}`);
        }
    }

    public cancelJoinOrOpen() {
        //may need to send some data to server depending on meetingStatus and isHost
        this.isHost = false;
        this.username = '';
        this.currentMeetingToken = '';
        this.initiatedRTCPeerConnections = {};
        this.establishedRTCPeerConnections = {};
        this.localStream = undefined;
        this.peerStreams = [];
        this.audioEnabled = true;
        this.videoEnabled = true;
        this.meetingStatus = MeetingStatus.NotInMeeting;
        this.messages = [];
    }
}
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

    private websocketConnection?: WebSocket;
    private websocketStatus = new ReplaySubject<string>(1);
    private username = '';
    private isHost = false;
    private currentMeetingId = '';
    private currentMeetingToken = '';
    private initiatedRTCPeerConnections = {};
    private establishedRTCPeerConnections = {};

    public localStream?: MediaStream;
    public peerStreams: MediaStream[] = [];

    public meetingStatus: MeetingStatus = MeetingStatus.NotInMeeting;

    public messages: Message[] = []; //this will need to be an array of message objects which includes a from field. meeting participants should have usernames as fields (both in frontend & backend)

    meetingStatusChanged = new EventEmitter<MeetingStatus>();
    receivedNewMessage = new EventEmitter<void>();
    receivedNewStream = new EventEmitter<void>();
    audioToggled = new EventEmitter<{id:string; status:boolean}>();
    videoToggled = new EventEmitter<{id:string; status:boolean}>();

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
                console.log(data);
                if (data.event === 'joined' || data.event === 'openedAsHost') {
                    this.handleJoinOrOpenAsHost(data);
                } else if (data.event === 'opened') {
                    this.meetingStatus = MeetingStatus.InMeeting;
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
            this.meetingStatus = MeetingStatus.InMeeting;
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
                    console.log(sessionId);
                    console.log(data.message);
                    this.audioToggled.emit({
                        id: sessionId,
                        status: data.message === 'true'
                    });
                } else if(data.messageType === 'videoToggle') {
                    console.log(sessionId);
                    console.log(data.message);
                    this.videoToggled.emit({
                        id: sessionId,
                        status: data.message === 'true'
                    })
                }
            }
            const newEstablishedConnection = {
                [sessionId]: {
                    dataChannel,
                    connection,
                    remoteStream: undefined,
                    username,
                    audioEnabled: false,
                    videoEnabled:false
                }
            }

            Object.assign(this.establishedRTCPeerConnections, newEstablishedConnection);

            connection.addEventListener('track', async (event) => {
                const [remoteStream] = event.streams;
                const connectionData = this.establishedRTCPeerConnections[sessionId as keyof typeof this.establishedRTCPeerConnections];
                (connectionData['remoteStream'] as any) = remoteStream;
                //check whether media tracks are enabled
                const audioTracks = remoteStream.getAudioTracks();
                audioTracks.forEach(track => {
                    if(track.enabled) {
                        (connectionData['audioEnabled'] as boolean) = true;
                        return;
                    }
                });
                const videoTracks = remoteStream.getVideoTracks();
                videoTracks.forEach(track => {
                    if(track.enabled) {
                        (connectionData['videoEnabled'] as boolean) = true;
                        return;
                    }
                });
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
                audioEnabled: false,
                videoEnabled: false
            }
        }
        Object.assign(this.establishedRTCPeerConnections, newEstablishedConnection);
        connection.ondatachannel = (event: RTCDataChannelEvent) => {
            (this.establishedRTCPeerConnections[initiatingPeerId as keyof typeof this.establishedRTCPeerConnections] as any).dataChannel = event.channel;
            const channel = (this.establishedRTCPeerConnections[initiatingPeerId as keyof typeof this.establishedRTCPeerConnections] as any).dataChannel;
            channel.onmessage = (messageEvent: MessageEvent) => {
                const data = JSON.parse(messageEvent.data);
                if(data.messageType === 'chat') {
                    const message = new Message(data.message, initiatingPeerUsername);
                    this.messages.push(message);
                    this.receivedNewMessage.emit();
                } else if(data.messageType === 'microphoneToggle') {
                    console.log(initiatingPeerId);
                    console.log(data.message);
                    this.audioToggled.emit({
                        id: initiatingPeerId,
                        status: data.message === 'true'
                    });
                } else if(data.messageType === 'videoToggle') {
                    console.log(initiatingPeerId);
                    console.log(data.message);
                    this.videoToggled.emit({
                        id: initiatingPeerId,
                        status: data.message === 'true'
                    })
                }
            }
        }

        this.localStream?.getTracks().forEach(track => {
            if (this.localStream) connection.addTrack(track, this.localStream);
        });

        connection.addEventListener('track', async (event) => {
            const [remoteStream] = event.streams;
            const connectionData = this.establishedRTCPeerConnections[initiatingPeerId as keyof typeof this.establishedRTCPeerConnections];
            (connectionData['remoteStream'] as any) = remoteStream;
            //check whether media tracks are enabled
            const audioTracks = remoteStream.getAudioTracks();
            audioTracks.forEach(track => {
                if(track.enabled) {
                    (connectionData['audioEnabled'] as boolean) = true;
                    return;
                }
            });
            const videoTracks = remoteStream.getVideoTracks();
            videoTracks.forEach(track => {
                if(track.enabled) {
                    (connectionData['videoEnabled'] as boolean) = true;
                    return;
                }
            });
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

    public authenticateToOtherUsersMeeting(meetingId:string, password:string) {
        this.meetingStatus = MeetingStatus.Authenticating;
        this.http.post(`/api/meeting/join?meetingId=${meetingId}&password=${password}`, {}).subscribe({
            next: (responseData: any) => {
                this.currentMeetingToken = responseData.access_token;
                this.meetingStatus = MeetingStatus.AwaitingUsernameInput;
                this.meetingStatusChanged.emit(this.meetingStatus);
            },
            error: (_error) => {
                this.meetingStatus = MeetingStatus.Error;
                this.meetingStatusChanged.emit(this.meetingStatus);
            }
        });
    }

    public joinMeeting(username:string) {
        navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then((stream: MediaStream) => {
                this.localStream = stream;
                this.meetingStatus = MeetingStatus.ConnectingToSignalingServer;
                this.username = username;
                this.checkAndEstablishWebSocketConnection();
                this.websocketStatus.subscribe({
                    next: (wsStatus) => {
                        if (wsStatus == 'open') {
                            this.meetingStatus = MeetingStatus.WaitingForHost;
                            const joinData = {
                                intent: 'join',
                                username
                            }
                            this.sendOverWebSocket(joinData);
                        }
                    }
                });
            })
            .catch(function (err) { console.log(err); });
    }

    public openMeeting(meetingId: string) {
        this.meetingStatus = MeetingStatus.Authenticating;
        if (this.authService.access_token) {
            const headers = new HttpHeaders({
                'Authorization': this.authService.getAuthorizationHeader()
            });
            const opts = { headers: headers };
            this.http.post('/api/users/host_token', { meetingId }, opts).subscribe({
                next: (responseData: any) => {
                    this.currentMeetingToken = responseData.access_token;
                    if(this.authService.activeUser) this.username = this.authService.activeUser?.name;
                    navigator.mediaDevices.getUserMedia(mediaConstraints)
                        .then((stream: MediaStream) => {
                            this.localStream = stream;
                            this.meetingStatus = MeetingStatus.ConnectingToSignalingServer;
                            this.websocketStatus.subscribe({
                                next: (wsStatus) => {
                                    if (wsStatus == 'open') {
                                        const openData = {
                                            intent: 'open',
                                            username: this.username
                                        }
                                        this.sendOverWebSocket(openData);
                                    }
                                }
                            })
                        }).catch(function (err) { console.log(err); });
                },
                error: (e) => {
                    this.meetingStatus = MeetingStatus.Error;
                    console.log(e);
                }
            });
        } else this.meetingStatus = MeetingStatus.Error; //need to more precisely handle permission-related errors
    }

    public broadCastMessage(messageType:string, message: string) {
        if (this.meetingStatus = MeetingStatus.InMeeting) {
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

    public toggleMicrophone() {
        if (this.localStream) {
            let status;
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled
                status = track.enabled;
            });
            this.broadCastMessage('microphoneToggle', `${status}`);
        }
    }

    public toggleVideo() {
        if (this.localStream) {
            let status;
            this.localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled
                status = track.enabled;
            });
            this.broadCastMessage('videoToggle', `${status}`);
        }
    }

    public logUserNames() {
        for(let sessionId in this.establishedRTCPeerConnections) {
            const peer = this.establishedRTCPeerConnections[sessionId as keyof typeof this.establishedRTCPeerConnections] as peer;
            console.log(peer.username);
        }
    }
}
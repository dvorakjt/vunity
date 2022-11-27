import { EventEmitter, Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import {MeetingsService} from '../meetings/meetings.service';
import {connect, ReplaySubject} from 'rxjs';

//probably need ws to trigger some sort of observable, and to restart when closed
//this service should probably be split into two separate services

// Declare SockJS and Stomp
declare var SockJS:any;
declare var Stomp:any;

const peerConnectionConfig:RTCConfiguration = {
    iceServers : [ {
        urls : "stun:stun2.1.google.com:19302"
    } ]
};

@Injectable()
export class SignalingService {
    private websocketConnection?:WebSocket;
    private websocketStatus = new ReplaySubject<string>(1);

    private isHost = false;
    private currentMeetingId = '';
    private currentMeetingToken = '';
    private initiatedRTCPeerConnections = {};
    private establishedRTCPeerConnections = [];

    apiCall = new EventEmitter<{success:boolean, message:string}>();

    constructor(private authService:AuthService, private meetingService:MeetingsService, private http:HttpClient) {
        this.checkAndEstablishWebSocketConnection();
    }

    private checkAndEstablishWebSocketConnection() {
        if(this.websocketConnection) {
            if(this.websocketConnection.readyState === WebSocket.CLOSING || this.websocketConnection.readyState === WebSocket.CLOSING) {
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
                if(data.event === 'joined' || data.event === 'openedAsHost') {
                    this.handleJoinOrOpenAsHost(data);
                } else if(data.event === 'opened') {
                    this.openConnections();
                } else if(data.event === 'offer') {
                    this.handleOffer(data);
                } else if(data.event === 'answer') {
                    this.handleAnswer(data);
                } else if(data.event === 'candidate') {
                    this.handleCandidate(data);
                }
            });
        }
    }

    private sendOverWebSocket(dto:any) {
        this.websocketStatus.subscribe({
            next: (status) => {
                if(status === 'open') {
                    let authData;
                    if(this.isHost && this.authService.access_token) {
                        authData = {
                            isHost: true,
                            userAccessToken : this.authService.access_token,
                            meetingId : this.currentMeetingId,
                        }
                    } else {
                        authData = {
                            isHost: false,
                            meetingAccessToken : this.currentMeetingToken
                        }
                    }
                    Object.assign(dto, authData);
                    this.websocketConnection?.send(JSON.stringify(dto));  
                }
            }
        })
    }

    private handleJoinOrOpenAsHost(data:any) { //data is going to become a specific type in future version
        for(const sessionId of data.preexistingSessions) {
            const newPeerConnection = {
                [sessionId] : new RTCPeerConnection(peerConnectionConfig)
            }
            Object.assign(this.initiatedRTCPeerConnections, newPeerConnection);
        }
        if(data.isOpen) {
            this.openConnections();
        }
    }

    private openConnections() {
        for(const sessionId in this.initiatedRTCPeerConnections) {
            const connection:RTCPeerConnection = this.initiatedRTCPeerConnections[sessionId as keyof typeof this.initiatedRTCPeerConnections];
            const dataChannel = connection.createDataChannel('dataChannel-' + sessionId);
            dataChannel.onmessage = (message) => {
                console.log(message);
            }
            const newEstablishedConnection = {
                [sessionId] : {
                    dataChannel,
                    connection
                }
            }
            Object.assign(this.establishedRTCPeerConnections, newEstablishedConnection);
            connection.createOffer().then((offer) => {
                connection.setLocalDescription(offer);
                this.websocketStatus.subscribe({
                    next: (status) => {
                        if(status === 'open') {
                            if(this.isHost && this.authService.access_token) {
                                const dto = {
                                    intent : 'offer',
                                    to : sessionId,
                                    isHost : true,
                                    userAccessToken : this.authService.access_token,
                                    meetingId : this.currentMeetingId,
                                    offer : JSON.stringify(new RTCSessionDescription(offer).toJSON())
                                }
                                this.websocketConnection?.send(JSON.stringify(dto));     
                            } else {
                                const dto = {
                                    intent : 'offer',
                                    to : sessionId,
                                    isHost : false,
                                    meetingAccessToken : this.currentMeetingToken,
                                    offer : JSON.stringify(new RTCSessionDescription(offer).toJSON())
                                }
                                this.websocketConnection?.send(JSON.stringify(dto));
                            }
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

    private handleOffer(data:any) {
        const connection = new RTCPeerConnection(peerConnectionConfig);
        const offer = new RTCSessionDescription(JSON.parse(data.offer));
        const initiatingPeerId = data.from;
        connection.onicecandidate = this.onIceCandidate(initiatingPeerId);
        connection.setRemoteDescription(offer);
        const newEstablishedConnection = {
            [initiatingPeerId] : {
                connection,
                dataChannel: undefined
            }
        }
        connection.ondatachannel = (event) => {
            console.log("data channel established");
            const peer:any = this.establishedRTCPeerConnections[initiatingPeerId];
            if(peer) {
                peer['dataChannel'] = event.channel;
                (peer['dataChannel'] as RTCDataChannel).send("Hi! You've connected with me.");
            }
        }
        Object.assign(this.establishedRTCPeerConnections, newEstablishedConnection);
        connection.createAnswer().then(answer => {
            connection.setLocalDescription(answer);   
            const dto = {
                intent : 'answer',
                to : initiatingPeerId,
                answer : JSON.stringify(new RTCSessionDescription(answer).toJSON())
            }
            this.sendOverWebSocket(dto);
        }).catch(e => {
            console.log(e);
        })
    }

    private onIceCandidate(toSessionId:string) {
        return (event:RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                const candidate = JSON.stringify(new RTCIceCandidate(event.candidate as RTCIceCandidateInit).toJSON());
                this.websocketStatus.subscribe({
                    next: (status) => {
                        if(status === 'open') {
                            if(this.isHost && this.authService.access_token) {
                                const dto = {
                                    intent : 'candidate',
                                    to : toSessionId,
                                    isHost : true,
                                    userAccessToken : this.authService.access_token,
                                    meetingId : this.currentMeetingId,
                                    candidate
                                }
                                this.websocketConnection?.send(JSON.stringify(dto));     
                            } else {
                                const dto = {
                                    intent : 'candidate',
                                    to : toSessionId,
                                    isHost : false,
                                    meetingAccessToken : this.currentMeetingToken,
                                    candidate
                                }
                                this.websocketConnection?.send(JSON.stringify(dto));
                            }
                        }
                    }
                });
            }
        }
    }

    private handleAnswer(data:any) {
        const answer = new RTCSessionDescription(JSON.parse(data.answer));
        const initiatingPeerId = data.from;
        const connection:RTCPeerConnection = this.establishedRTCPeerConnections[initiatingPeerId]['connection'];
        connection.setRemoteDescription(answer);
    }

    private handleCandidate(data:any) {
        const candidate = new RTCIceCandidate(JSON.parse(data.candidate));
        const initiatingPeerId = data.from;
        const connection:RTCPeerConnection = this.establishedRTCPeerConnections[initiatingPeerId]['connection'];
        connection.addIceCandidate(candidate);
}

    public joinMeeting(meetingId:string, password:string) {
        this.http.post(`/api/meeting/join?meetingId=${meetingId}&password=${password}`, {}).subscribe({
            next: (responseData:any) => {
                this.currentMeetingToken = responseData.access_token;
                this.checkAndEstablishWebSocketConnection();
                this.websocketStatus.subscribe({
                    next: (wsStatus) => {
                        if(wsStatus == 'open') {
                            const joinData = {
                                intent: 'join',
                                isHost: false,
                                meetingAccessToken: this.currentMeetingToken
                            }
                            this.websocketConnection?.send(JSON.stringify(joinData));
                        }
                    }
                });
            },
            error: (error) => {
                console.log(error); //add in toasts service or some form of user notification
            }
        })
    }

    public openMeeting(meetingId:string) {
        console.log("trying to open meeting");
        if(this.authService.access_token) {
            this.websocketStatus.subscribe({
                next: (wsStatus) => {
                    if(wsStatus == 'open') {
                        this.currentMeetingId = meetingId;
                        this.isHost = true;
                        const openData = {
                            intent: 'open',
                            isHost : true,
                            userAccessToken : this.authService.access_token,
                            meetingId
                        }
                        this.websocketConnection?.send(JSON.stringify(openData));
                    }
                }
            })
        }
    }
}
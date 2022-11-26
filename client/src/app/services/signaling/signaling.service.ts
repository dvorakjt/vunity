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

const peerConnectionConfig = undefined;

@Injectable()
export class SignalingService {
    private websocketConnection?:WebSocket;
    private websocketStatus = new ReplaySubject<string>(1);

    private isHost = false;
    private currentMeetingId = '';
    private currentMeetingToken = '';
    private initiatedRTCPeerConnections = {};
    private establisehdRTCPeerConnections = [];

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
                console.log(data);
                if(data.event === 'joined' || data.event === 'openedAsHost') {
                    for(const sessionId of data.preexistingSessions) {
                        const newPeerConnection = {
                            [sessionId] : new RTCPeerConnection(peerConnectionConfig)
                        }
                        Object.assign(this.initiatedRTCPeerConnections, newPeerConnection);
                    }
                    if(data.isOpen) {
                        this.openConnections();
                    }
                } else if(data.event === 'opened') {
                    this.openConnections();
                } else if(data.event === 'offer') {
                    const connection = new RTCPeerConnection(peerConnectionConfig);
                    const offer = new RTCSessionDescription(JSON.parse(data.offer));
                    const initiatingPeerId = data.from;
                    //need to set data channel?
                    connection.setRemoteDescription(offer);
                    const newEstablishedConnection = {
                        [initiatingPeerId] : {
                            connection,
                            dataChannel: undefined
                        }
                    }
                    Object.assign(this.establisehdRTCPeerConnections, newEstablishedConnection);
                    connection.createAnswer().then(answer => {
                        this.websocketStatus.subscribe({
                            next: (status) => {
                                if(status === 'open') {
                                    if(this.isHost && this.authService.access_token) {
                                        const dto = {
                                            intent : 'answer',
                                            to : initiatingPeerId,
                                            isHost : true,
                                            userAccessToken : this.authService.access_token,
                                            meetingId : this.currentMeetingId,
                                            answer : JSON.stringify(new RTCSessionDescription(answer).toJSON())
                                        }
                                        this.websocketConnection?.send(JSON.stringify(dto));     
                                    } else {
                                        const dto = {
                                            intent : 'answer',
                                            to : initiatingPeerId,
                                            isHost : false,
                                            meetingAccessToken : this.currentMeetingToken,
                                            answer : JSON.stringify(new RTCSessionDescription(answer).toJSON())
                                        }
                                        this.websocketConnection?.send(JSON.stringify(dto));
                                    }
                                }
                            }
                        })
                    }).catch(e => {
                        console.log(e);
                    })
                }
            });
        }
    }

    private openConnections() {
        for(const sessionId in this.initiatedRTCPeerConnections) {
            const connection:RTCPeerConnection = this.initiatedRTCPeerConnections[sessionId as keyof typeof this.initiatedRTCPeerConnections];
            const dataChannel = connection.createDataChannel('dataChannel-' + sessionId);
            const newEstablishedConnection = {
                [sessionId] : {
                    dataChannel,
                    connection
                }
            }
            Object.assign(this.establisehdRTCPeerConnections, newEstablishedConnection);
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
        }
        this.initiatedRTCPeerConnections = {};
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
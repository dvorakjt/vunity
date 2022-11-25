import { EventEmitter, Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import { Meeting } from 'src/app/models/meeting.model';
import { MeetingDTO } from 'src/app/models/meeting-dto.model';
import { ReplaySubject } from 'rxjs';

//probably need ws to trigger some sort of observable, and to restart when closed
//this service should probably be split into two separate services

// Declare SockJS and Stomp
declare var SockJS:any;
declare var Stomp:any;

const peerConnectionConfig = undefined;

@Injectable()
export class MeetingsService {
    private meetings:Meeting[] = [];
    private websocketConnection:WebSocket;
    private websocketStatus = new ReplaySubject<string>(1);
    private currentMeetingToken?:string;
    private localDescription:string = '';
    private ICECandidates:string[] = []; //ICE Candidates actually has to be an array or list !!!
    private sentJoinData = false;
    private sentOpenData = false;
    private peerSessions = {};
    private isHost = false;
    private currentMeetingId = '';
    
    meetingsModified = new EventEmitter<Meeting[]>();

    apiCall = new EventEmitter<{success:boolean, message:string}>();

    constructor(private authService:AuthService, private http:HttpClient) {
        this.websocketStatus.next('loading');
        this.websocketConnection = new WebSocket('ws://localhost:8080/socket'); //websocket should be reopened if closed
        this.websocketConnection.onopen = () => {
            console.log('open');
            this.websocketStatus.next('open');
            this.websocketConnection.addEventListener('message', (message) => {
                console.log(message);
                const data = JSON.parse(message.data);
                console.log(data.intent);
                if(data.intent == 'offer') {
                    const {peerSessionId, offer, candidates} = data;
                    if(peerSessionId && offer && candidates) {
                        this.onReceivedOffer(peerSessionId, offer, candidates);
                    }
                }
            });
        }
        //get the user's meetings as soon as they login
        authService.isAuthenticated.subscribe((isAuthenticated) => {
            if(isAuthenticated) {
                this.loadMeetings();
            }
        });
    }

    private onReceivedOffer(peerSessionId:string, peerOffer:RTCSessionDescriptionInit, peerICECandidates:RTCIceCandidateInit[]) {
        console.log("Received an offer");
        const peerConnection = new RTCPeerConnection(peerConnectionConfig);
        peerConnection.setRemoteDescription(new RTCSessionDescription(new RTCSessionDescription(peerOffer)));
        for(let i = 0; i < peerICECandidates.length; i++) {
            const peerICECandidate = peerICECandidates[i];
            console.log(new RTCIceCandidate(peerICECandidate));
            peerConnection.addIceCandidate(new RTCIceCandidate(peerICECandidate));
        }
            //create data channel, etc? remember only one of these should actually display to user's own screen
            peerConnection.createAnswer((answer) => {
                peerConnection.setLocalDescription(answer);
                const sessionAndConnection = {[peerSessionId] : {
                    peerConnection : peerConnection,
                    transactionComplete : false
                }};
                Object.assign(this.peerSessions, sessionAndConnection);
                const stringifiedAnswer = JSON.stringify(new RTCSessionDescription(answer).toJSON());
                if(this.isHost) {
                    this.authService.isAuthenticated.subscribe({
                        next: (isAuthenticated) => {
                            if(isAuthenticated) {
                                const answerData = {
                                    isHost: true,
                                    intent: "answer",
                                    to: peerSessionId,
                                    userAccessToken: this.authService.access_token,
                                    meetingId : this.currentMeetingId,
                                    answer : stringifiedAnswer
                                }
                                this.websocketStatus.subscribe({
                                    next: (value) => {
                                        if(value == 'open') {
                                            console.log('sending answer');
                                            this.websocketConnection.send(JSON.stringify(answerData));
                                        }
                                    }
                                });
                            }
                        }
                    });
                } else {
                    const answerData = {
                        isHost: false,
                        intent: "answer",
                        to: peerSessionId,
                        meetingAccessToken: this.currentMeetingToken,
                        answer : stringifiedAnswer
                    }
                    this.websocketStatus.subscribe({
                        next: (value) => {
                            if(value == 'open') {
                                console.log('sending answer');
                                this.websocketConnection.send(JSON.stringify(answerData));
                            }
                        }
                    });
                }
        }, function(error) {
            console.log(error);
        });
    }

    private onReceivedAnswer(peerSessionId:string, peerAnswer:RTCSessionDescriptionInit) {
        const peerConnection = new RTCPeerConnection(peerConnectionConfig);
        peerConnection.setLocalDescription(JSON.parse(this.localDescription));
        peerConnection.setRemoteDescription(new RTCSessionDescription(peerAnswer));
        //create data channel, etc? remember only one of these should actually display to user's own screen
        const sessionAndConnection = {[peerSessionId] : {
            peerConnection : peerConnection,
            transactionComplete : false
        }};
        Object.assign(this.peerSessions, sessionAndConnection);
    }

    private loadMeetings() { //eventually this should only get meetings within a week...?
        //first look in indexed db
        this.http.get('/api/users/meetings').subscribe((responseData) => {
            this.meetings = responseData as Meeting[];
            this.meetingsModified.emit(this.getMeetings());
        });
    }

    getMeetings() {
        return this.meetings.slice();
    }

    createMeeting(newMeeting:MeetingDTO) {
        this.http.post('/api/users/new_meeting', newMeeting).subscribe({
            next: (responseData) => {
                console.log(responseData);
                this.meetings.push(responseData as Meeting);
                this.meetingsModified.emit(this.getMeetings());
                this.apiCall.emit({success:true, message:"succeeded"});
            },
            error: (error) => {
                this.apiCall.emit({success:false, message:error.message});
            }
        });
    }

    initializeLocalPeerConnection() {
        return new Promise((resolve, reject) => {
            const peerConnection = new RTCPeerConnection(peerConnectionConfig);

            //this is a necessary step
            var dataChannel = peerConnection.createDataChannel("dataChannel");

            peerConnection.createOffer().then((offer) => {
                this.localDescription = JSON.stringify(new RTCSessionDescription(offer).toJSON());
                peerConnection.setLocalDescription(offer);
                peerConnection.onicecandidate = (event) => {
                    if(event.candidate) {
                        this.ICECandidates.push(JSON.stringify(new RTCIceCandidate(event.candidate).toJSON()));
                    } else resolve("initialized local peer");
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }


    joinMeeting(meetingId:string, password:string) {
        this.isHost = false;
        this.sentJoinData = false;
        this.http.post(`/api/meeting/join?meetingId=${meetingId}&password=${password}`, {}).subscribe({
            next: (responseData:any) => {
                this.currentMeetingToken = responseData.access_token;
                this.initializeLocalPeerConnection().then(() => {
                    const joinData = {
                        isHost: false,
                        intent: "join",
                        meetingAccessToken: this.currentMeetingToken,
                        offer: this.localDescription,
                        ICECandidates: this.ICECandidates
                    }
                    this.websocketStatus.subscribe({
                        next: (value) => {
                            if(value == 'open' && !this.sentJoinData) {
                                this.sentJoinData = true;
                                this.websocketConnection.send(JSON.stringify(joinData));
                            }
                        }
                    })
                }).catch((error) => {
                    console.log(error); //eventually this should probably appear as a toast or something
                });
            }
        });
    }

    openMeeting(meetingId:string) {
        this.isHost = true;
        this.currentMeetingId = meetingId;
        this.sentOpenData = false;
        this.authService.isAuthenticated.subscribe({
            next: (isAuthenticated) => {
                if(isAuthenticated && !this.sentOpenData) {
                    this.initializeLocalPeerConnection().then(() => {
                        const openData = {
                            isHost: true,
                            intent: "open",
                            userAccessToken: this.authService.access_token,
                            meetingId,
                            offer: this.localDescription,
                            ICECandidates: this.ICECandidates
                        }
                        this.websocketStatus.subscribe({
                            next: (value) => {
                                if(value == 'open' && !this.sentOpenData) {
                                    this.sentOpenData = true;
                                    this.websocketConnection.send(JSON.stringify(openData));
                                }
                            }
                        })
                    }).catch((error) => {
                        console.log(error); //again, this should probably appear as a toast
                    })
                }
            }
        });
    }
}
import { EventEmitter, Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import { Meeting } from 'src/app/models/meeting.model';
import { MeetingDTO } from 'src/app/models/meeting-dto.model';
import { ReplaySubject } from 'rxjs';

// Declare SockJS and Stomp
declare var SockJS:any;
declare var Stomp:any;

@Injectable()
export class MeetingsService {
    private meetings:Meeting[] = [];
    private currentMeetingToken:string = '';
    private websocketConnection?:WebSocket;
    private peerConnection?:RTCPeerConnection;
    private dataChannel?:RTCDataChannel;
    
    meetingsModified = new EventEmitter<Meeting[]>();

    apiCall = new EventEmitter<{success:boolean, message:string}>();

    constructor(private authService:AuthService, private http:HttpClient) {
        //get the user's meetings as soon as they login
        authService.isAuthenticated.subscribe((isAuthenticated) => {
            if(isAuthenticated) {
                this.loadMeetings();
            }
        });

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

    joinMeeting(meetingId:string, password:string) {
        const peerConnectionConfig = undefined;
        this.peerConnection = new RTCPeerConnection(peerConnectionConfig);
        this.dataChannel = this.peerConnection.createDataChannel("dataChannel");

        this.http.post(`/api/meeting/join?meetingId=${meetingId}&password=${password}`, {}).subscribe({
            next: (responseData:any) => {
                this.currentMeetingToken = responseData.access_token;
                this.websocketConnection = new WebSocket('ws://localhost:8080/socket');
                this.peerConnection?.createOffer((offer) => {
                    this.websocketConnection?.addEventListener('open', (_event) => {
                        const joinData = {
                            isHost: false,
                            intent: "offer",
                            meetingAccessToken:responseData.access_token, //will send meetingId + userAccessToken for opening a meeting
                            offer
                        }
                        this.websocketConnection?.send(JSON.stringify(joinData));
                    });
                    this.websocketConnection?.addEventListener('message', (message:any) => {
                        console.log(message);
                    });
                    this.peerConnection?.setLocalDescription(offer);
                }, (error) => {
                    console.log(error);
                });
            }
        })
    }

    /////

    openMeeting(meetingId:string) {
        this.authService.isAuthenticated.subscribe({
            next: (isAuthenticated) => {
                if(isAuthenticated) {
                    this.websocketConnection = new WebSocket('ws://localhost:8080/socket');
                    this.websocketConnection.addEventListener('open', (event) => {
                        const openData = {
                            isHost: true,
                            intent: "open",
                            userAccessToken: this.authService.access_token,
                            meetingId //will send meetingId + userAccessToken for opening a meeting
                        }
                        this.websocketConnection?.send(JSON.stringify(openData));
                    });
                    this.websocketConnection.addEventListener('message', (message:any) => {
                        console.log(message);
                    });
                }
            }
        })
    }
}
import { EventEmitter, Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import { Meeting } from 'src/app/models/meeting.model';
import { MeetingDTO } from 'src/app/models/meeting-dto.model';

//probably need ws to trigger some sort of observable, and to restart when closed
//this service should probably be split into two separate services

@Injectable()
export class MeetingsService {
    private meetings:Meeting[] = [];
    
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
}
import { EventEmitter, Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import { Meeting } from 'src/app/models/meeting.model';

@Injectable()
export class MeetingsService {
    private meetings:Meeting[] = [];
    
    meetingsModified = new EventEmitter<Meeting[]>();

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

    createMeeting() {
        return null;
    }
}
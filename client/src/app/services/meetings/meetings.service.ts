import { EventEmitter, Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import { Meeting } from 'src/app/models/meeting.model';
import { MeetingDTO } from 'src/app/models/meeting-dto.model';
import { UpcomingMeetings } from 'src/app/types/upcoming-meetings.type';
import { MeetingsByYearAndMonth } from 'src/app/types/meetings-by-year-and-month.type';
import { getCurrentMonthAndYear, getMonth, getNextMonthAndYear, getTimezoneOffsetString, padLeftWithZeroes } from 'src/app/utils/datetime.util';

//probably need ws to trigger some sort of observable, and to restart when closed
//this service should probably be split into two separate services

@Injectable()
export class MeetingsService {

    //this should somehow update in real time
    //should also be updated when user creates, edits, deletes a meeting
    public upcomingMeetings:UpcomingMeetings = {
        today : [],
        tomorrow : [],
        laterThisWeek : []
    }

    //should be update when user creates, edits, deletes a meeting
    public meetingsByYearAndMonth:MeetingsByYearAndMonth = {
    }

    private offsetStr = '';
    
    meetingsModified = new EventEmitter<Meeting[]>();

    apiCall = new EventEmitter<{success:boolean, message:string}>();

    constructor(private authService:AuthService, private http:HttpClient) {
        //get the user's meetings as soon as they login
        authService.isAuthenticated.subscribe((isAuthenticated) => {
            if(isAuthenticated) {
                this.offsetStr = getTimezoneOffsetString();
                const {year, month} = getCurrentMonthAndYear();
                const meetingsThisMonth = this.loadMeetings(year, month);
                //get upcomingMeetings from this value^
            }
        });
    }

    //accepts 0 for january
    //need guards for years and months greater than 4 and 2 digits long and outside the acceptable range
    private loadMeetings(year:number, month:number) {

        const monthStr = getMonth(month);

        //increment month because it is 0-indexed but ISO is 1-indexed
        month++;

        if(this.meetingsByYearAndMonth[year] && this.meetingsByYearAndMonth[year][monthStr]) {
            return this.meetingsByYearAndMonth[year][monthStr];
        }

        const timeZoneOffsetString = getTimezoneOffsetString();

        let paddedYear = padLeftWithZeroes(String(year), 4);

        let paddedMonth = padLeftWithZeroes(String(month), 2);
        
        const startDate = new Date(`${paddedYear}-${paddedMonth}-01T00:00${timeZoneOffsetString}`).getMilliseconds();

        let [nextMonth, nextYear] = getNextMonthAndYear(month, year);
        
        paddedYear = padLeftWithZeroes(String(nextYear), 4);
        paddedMonth = padLeftWithZeroes(String(nextMonth), 2);

        const endDate = new Date(`${paddedYear}-${paddedMonth}-01T00:00${timeZoneOffsetString}`).getMilliseconds();

        this.http.get(`/api/users/meetings?startDate=${startDate}&endDate=${endDate}`).subscribe((responseData) => {
            this.meetingsByYearAndMonth[year][monthStr] = responseData as Meeting[];
            return this.meetingsByYearAndMonth[year][monthStr];
            //this.meetingsModified.emit();
        });
    }


    createMeeting(newMeeting:MeetingDTO) {
        this.http.post('/api/users/new_meeting', newMeeting).subscribe({
            next: (responseData) => {
                console.log(responseData);
                this.meetingsModified.emit();
                //this.apiCall.emit({success:true, message:"succeeded"});
            },
            error: (error) => {
                this.apiCall.emit({success:false, message:error.message});
            }
        });
    }
}
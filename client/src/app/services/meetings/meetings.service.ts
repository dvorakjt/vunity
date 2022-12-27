import { EventEmitter, Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import { Meeting } from 'src/app/models/meeting.model';
import { MeetingDTO } from 'src/app/models/meeting-dto.model';
import { UpcomingMeetings } from 'src/app/types/upcoming-meetings.type';
import { MeetingsByYearAndMonth } from 'src/app/types/meetings-by-year-and-month.type';
import { DateTime } from 'luxon';

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

    private TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    meetingsModified = new EventEmitter<Meeting[]>();

    apiCall = new EventEmitter<{success:boolean, message:string}>();

    constructor(private authService:AuthService, private http:HttpClient) {
        console.log(this.TZ);
        //get the user's meetings as soon as they login
        authService.isAuthenticated.subscribe((isAuthenticated) => {
            if(isAuthenticated) {
               this.loadUpcomingMeetings();
            }
        });
    }

    //meeting password is encrypted when it comes back from the db
    //this should search a local hashmap of meetings by id before requesting data from the server
    public getMeetingById(meetingId:string) {
        return new Promise((resolve, reject) => {
            this.http.get(`/api/users/meeting?meetingId=${meetingId}`).subscribe(({
                next: (responseData) => {   
                    console.log(responseData);
                    resolve(responseData as Meeting);
                },
                error: (e) => {
                    reject(e);
                }
            }));
        });
    }

    private loadUpcomingMeetings() {
        const today = DateTime.now().startOf('day');
        const nextWeek = today.plus({weeks: 1});
        const startDateMillis = today.toMillis();
        const endDateMillis = nextWeek.toMillis();
        this.http.get(`/api/users/meetings?startDate=${startDateMillis}&endDate=${endDateMillis}`).subscribe((responseData) => {

                
            const upcomingMeetings = (responseData as any[]).map((data:any) => {
              return new Meeting(data.id, data.title, data.password, data.duration, data.startDateTime, data.guests, data.ownerId);
            }).sort((a, b) => {
                const startDT_A = DateTime.fromISO(a.startDateTime);
                const startDT_B = DateTime.fromISO(b.startDateTime);
                if(startDT_A < startDT_B) return -1;
                else if(startDT_A > startDT_B) return 1;
                else return 0;
            });

            const tomorrow = today.plus({days: 1});
            const theDayAfter = tomorrow.plus({days: 1});
            
            for(let meeting of upcomingMeetings) {
                const startDateTime = DateTime.fromISO(meeting.startDateTime);
                if(startDateTime >= today && startDateTime < tomorrow) this.upcomingMeetings.today.push(meeting);
                else if(startDateTime >= tomorrow && startDateTime < theDayAfter) this.upcomingMeetings.tomorrow.push(meeting);
                else if(startDateTime >= theDayAfter && startDateTime < nextWeek) this.upcomingMeetings.laterThisWeek.push(meeting);
            }

            //this.meetingsModified.emit();
        }, (error) => {
            console.log(error);
        });
    }

    //need guards for years and months greater than 4 and 2 digits long and outside the acceptable range
    public loadMeetingsByMonthAndYear(month:number, year:number) {

        return new Promise<Meeting[]>((resolve, reject) => {
           
            const monthDT = DateTime.fromObject({year, month, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0});
            const startDateMillis = monthDT.toMillis();
            const endDateMillis = monthDT.plus({months: 1}).toMillis();

            this.http.get(`/api/users/meetings?startDate=${startDateMillis}&endDate=${endDateMillis}`).subscribe((responseData) => {
                
                resolve((responseData as any[]).map((data:any) => {
                    return new Meeting(data.id, data.title, data.password, data.duration, data.startDateTime, data.guests, data.ownerId);
                  }).sort((a, b) => {
                    const startDT_A = DateTime.fromISO(a.startDateTime);
                    const startDT_B = DateTime.fromISO(b.startDateTime);
                    if(startDT_A < startDT_B) return -1;
                    else if(startDT_A > startDT_B) return 1;
                    else return 0;
                }));

                //this.meetingsModified.emit();
            }, (error) => {
                reject(error);
            });
        });
    }


    createMeeting(newMeeting:MeetingDTO) {
        this.http.post('/api/users/new_meeting', newMeeting).subscribe({
            next: (responseData) => {
                console.log(responseData);
                this.meetingsModified.emit();
                this.apiCall.emit({success:true, message:"succeeded"});
            },
            error: (error) => {
                this.apiCall.emit({success:false, message:error.message});
            }
        });
    }
}
import { EventEmitter, Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import { Meeting } from 'src/app/models/meeting.model';
import { MeetingDTO } from 'src/app/models/meeting-dto.model';
import { UpcomingMeetings } from 'src/app/types/upcoming-meetings.type';
import { MeetingsByYearAndMonth } from 'src/app/types/meetings-by-year-and-month.type';
import { DateTime } from 'luxon';
import { MeetingsById } from 'src/app/types/meetings-by-id.type';
import { MeetingUpdateDTO } from 'src/app/models/meeting-update-dto.model';

@Injectable()
export class MeetingsService {

    //this should somehow update in real time
    //should also be updated when user creates, edits, deletes a meeting
    public upcomingMeetings:UpcomingMeetings = {
        today : [], //these could be heaps so when they are modified, the order is preserved
        tomorrow : [],
        laterThisWeek : []
    }

    //should be update when user creates, edits, deletes a meeting
    public meetingsByYearAndMonth:MeetingsByYearAndMonth = {}

    public meetingsById:MeetingsById = {};

    private TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    meetingsModified = new EventEmitter<Meeting[]>();

    apiCall = new EventEmitter<{success:boolean, message:string}>();

    constructor(private authService:AuthService, private http:HttpClient) {
        authService.isAuthenticated.subscribe((isAuthenticated) => {
            if(isAuthenticated) {
               this.loadUpcomingMeetings();
            }
        });
    }

    //this should search a local hashmap of meetings by id before requesting data from the server
    public getMeetingById(meetingId:string) {
        return new Promise((resolve, reject) => {
            if(this.meetingsById[meetingId]) resolve(this.meetingsById[meetingId]);
            else {
                this.http.get(`/api/users/meeting?meetingId=${meetingId}`).subscribe(({
                    next: (responseData) => {   
                        const meeting = responseData as Meeting;
                        this.addMeetingToMeetingsById(meeting);
                        resolve(meeting);
                    },
                    error: (e) => {
                        reject(e);
                    }
                }));
            }
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
                this.addMeetingToMeetingsById(meeting);
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
        //should add this locally to upcoming meetings, meetings by id, and meetings by month and year, if that month and year exists!
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

    addMeetingToMeetingsById(meeting:Meeting) {
        this.meetingsById[meeting.id] = meeting;
    }

    deleteMeeting(meetingId:string) {
        return new Promise<void>((resolve, reject) => {
            this.http.delete(`/api/users/delete_meeting?id=${meetingId}`).subscribe({
                next: () => {
                    this.deleteMeetingLocally(meetingId);
                    this.meetingsModified.emit();
                    resolve();
                },
                error: (error) => {
                    reject(error.message);
                }
            });
        });
    }

    deleteMeetingLocally(meetingId:string) {
        const meeting = this.meetingsById[meetingId];
        if(meeting) {

            //remove meeting from upcomingMeetings
            let meetingFoundInUpcomingMeetings = false;

            this.upcomingMeetings.today = this.upcomingMeetings.today.filter((m) => {
                if(m.id === meetingId) meetingFoundInUpcomingMeetings = true;
                return m.id != meetingId;
            });
            if(!meetingFoundInUpcomingMeetings) this.upcomingMeetings.tomorrow = this.upcomingMeetings.tomorrow.filter((m) => {
                if(m.id === meetingId) meetingFoundInUpcomingMeetings = true;
                return m.id != meetingId;
            });
            if(!meetingFoundInUpcomingMeetings) this.upcomingMeetings.laterThisWeek = this.upcomingMeetings.laterThisWeek.filter((m) => {
                return m.id != meetingId;
            });

            //remove meeting from meetingsByYearAndMonth
            const meetingDateTime = DateTime.fromISO(meeting.startDateTime);
            const meetingYear = String(meetingDateTime.year);
            const meetingMonth = meetingDateTime.monthLong;

            if(this.meetingsByYearAndMonth[meetingYear] && this.meetingsByYearAndMonth[meetingYear][meetingMonth]) {
                let monthOfMeeting = this.meetingsByYearAndMonth[meetingYear][meetingMonth];
                monthOfMeeting = monthOfMeeting.filter((m) => {
                    return m.id != meetingId;
                });
            }

            //remove the meeting from meetingsById
            delete this.meetingsById[meetingId];
        }
    }

    updateMeeting(meetingUpdateDTO:MeetingUpdateDTO) {
        return new Promise<void>((resolve, reject) => {
            this.http.put('/api/users/update_meeting', meetingUpdateDTO).subscribe({
                next: () => {
                    this.updateMeetingLocally(meetingUpdateDTO.id);
                    this.meetingsModified.emit();
                    resolve();
                },
                error: (error) => {
                    reject(error.message);
                }   
            });
        });
    }

    updateMeetingLocally(meetingId:string) {
        //updates meetingsById and upcomingMeetings always
        //updates meetingsByYearAndMonth if either the original year and month or the new year and month were already loaded from the server
    }

}
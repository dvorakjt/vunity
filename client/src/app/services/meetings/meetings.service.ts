import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {AuthService} from '../auth/auth.service';
import { Meeting } from 'src/app/models/meeting.model';
import { MeetingDTO } from 'src/app/models/meeting-dto.model';
import { UpcomingMeetings } from 'src/app/types/upcoming-meetings.type';
import { MeetingsByYearAndMonth } from 'src/app/types/meetings-by-year-and-month.type';
import { DateTime } from 'luxon';
import { MeetingsById } from 'src/app/types/meetings-by-id.type';
import { MeetingUpdateDTO } from 'src/app/models/meeting-update-dto.model';
import { getMonthStr } from 'src/app/utils/datetime.util';

@Injectable({providedIn: 'root'})
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
    
    meetingsModified = new EventEmitter<Meeting[]>();

    apiCall = new EventEmitter<{success:boolean, message:string}>();

    constructor(private authService:AuthService, private http:HttpClient) {
        authService.isAuthenticated.subscribe((isAuthenticated) => {
            if(isAuthenticated) {
               this.loadUpcomingMeetings();
               const now = DateTime.now();
               this.loadMeetingsByMonthAndYear(now.month, now.year).then((res) => {
                console.log(res);
                console.log(this.meetingsByYearAndMonth);
               }).catch((e) => {
                console.log(e);
               });
            }
        });
    }

    //this should search a local hashmap of meetings by id before requesting data from the server
    public getMeetingById(meetingId:string) {
        return new Promise((resolve, reject) => {
            if(this.meetingsById[meetingId]) resolve(this.meetingsById[meetingId]);
            else {
                this.http.post(`/api/users/meeting?meetingId=${meetingId}`, {}).subscribe(({
                    next: (responseData) => {   
                        const meeting = Meeting.fromMeetingObjectWithDTInMillis(responseData);
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
        this.http.post(`/api/users/meetings?startDate=${startDateMillis}&endDate=${endDateMillis}`, {}).subscribe((responseData) => {

            this.upcomingMeetings.today = [];
            this.upcomingMeetings.tomorrow = [];
            this.upcomingMeetings.laterThisWeek = [];
                
            const upcomingMeetings = this.sortMeetings((responseData as any[]).map((data:any) => {
              return Meeting.fromMeetingObjectWithDTInMillis(data);
            }));
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

    private sortMeetings(meetings:Meeting[]) {
        return meetings.sort((a, b) => {
            const startDT_A = DateTime.fromISO(a.startDateTime);
            const startDT_B = DateTime.fromISO(b.startDateTime);
            if(startDT_A < startDT_B) return -1;
            else if(startDT_A > startDT_B) return 1;
            else return 0;
        });
    }   

    //need guards for years and months greater than 4 and 2 digits long and outside the acceptable range
    public loadMeetingsByMonthAndYear(month:number, year:number) {

        console.log("loading meetings by month and year");

        return new Promise<Meeting[]>((resolve, reject) => {

            const yearStr = String(year);
            const monthStr = getMonthStr(month);
            
            if(this.meetingsByYearAndMonth[yearStr] && this.meetingsByYearAndMonth[yearStr][monthStr]) {
                resolve(this.meetingsByYearAndMonth[yearStr][monthStr]);
            }

            const monthDT = DateTime.fromObject({year, month, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0});
            const startDateMillis = monthDT.toMillis();
            const endDateMillis = monthDT.plus({months: 1}).toMillis();

            this.http.post(`/api/users/meetings?startDate=${startDateMillis}&endDate=${endDateMillis}`, {}).subscribe((responseData) => {
                
                const meetings = (responseData as any[]).map((data:any) => {
                    return Meeting.fromMeetingObjectWithDTInMillis(data);
                });

                if(!this.meetingsByYearAndMonth[yearStr]) {
                    this.meetingsByYearAndMonth[yearStr] = {};
                }
                if(!this.meetingsByYearAndMonth[yearStr][monthStr]) {
                    this.meetingsByYearAndMonth[yearStr][monthStr] = meetings;
                }

                resolve(meetings);

                //this.meetingsModified.emit();
            }, (error) => {
                reject(error);
            });
        });
    }


    createMeeting(newMeetingDTO:MeetingDTO) {
        //should add this locally to upcoming meetings, meetings by id, and meetings by month and year, if that month and year exists!
        this.http.post('/api/users/new_meeting', newMeetingDTO, {observe: 'response'}).subscribe({
            next: (responseData:any) => {
                const meeting = Meeting.fromMeetingObjectWithDTInMillis(responseData.body.meeting);

                this.addMeetingToMeetingsById(meeting);
                this.addMeetingToUpcomingMeetings(meeting);
                this.addMeetingToMeetingsByYearAndMonth(meeting);

                const message = responseData.status == 207 ?
                    `The meeting was created but we could not reach the following guests' email addresses: ${responseData.body.unreachableEmailAddresses.join(", ")}` :
                    "succeeded";

                this.meetingsModified.emit();
                this.apiCall.emit({success:true, message});
            },
            error: (error) => {
                this.apiCall.error(error);
            }
        });
    }

    addMeetingToMeetingsById(meeting:Meeting) {
        this.meetingsById[meeting.id] = meeting;
    }

    addMeetingToUpcomingMeetings(meeting:Meeting) {
        const today = DateTime.now().startOf('day');
        const tomorrow = today.plus({days: 1});
        const theDayAfter = tomorrow.plus({days: 1});
        const nextWeek = today.plus({days: 7});
        const meetingDateTime = DateTime.fromISO(meeting.startDateTime);
        if(meetingDateTime >= today && meetingDateTime < tomorrow) {
            this.upcomingMeetings.today.push(meeting);
            this.upcomingMeetings.today = this.sortMeetings(this.upcomingMeetings.today);
        } else if(meetingDateTime >= tomorrow && meetingDateTime < theDayAfter) {
            this.upcomingMeetings.tomorrow.push(meeting);
            this.upcomingMeetings.tomorrow = this.sortMeetings(this.upcomingMeetings.tomorrow);
        } else if(meetingDateTime >= theDayAfter && meetingDateTime < nextWeek) {
            this.upcomingMeetings.laterThisWeek.push(meeting);
            this.upcomingMeetings.laterThisWeek = this.sortMeetings(this.upcomingMeetings.laterThisWeek);
        }
    }

    addMeetingToMeetingsByYearAndMonth(meeting:Meeting) {
        const meetingDateTime = DateTime.fromISO(meeting.startDateTime);
        const year = String(meetingDateTime.year);
        const month = meetingDateTime.monthLong;
        if(this.meetingsByYearAndMonth[year] && this.meetingsByYearAndMonth[year][month]) {
            this.meetingsByYearAndMonth[year][month].push(meeting);
        }
    }

    deleteMeeting(meetingId:string) {
        return new Promise<string>((resolve, reject) => {
            this.http.delete(`/api/users/delete_meeting?id=${meetingId}`, {observe: 'response'}).subscribe({
                next: (responseData:any) => {
                    this.deleteMeetingLocally(meetingId);
                    this.meetingsModified.emit();
                    const result = 
                        responseData.status == '207' ? 
                            `The meeting was deleted but we could not reach the following guests to inform them: ${responseData.body.unreachableEmailAddresses.join(", ")}` :
                            'The meeting was successfully deleted and your guests were notified via email.';
                    resolve(result);
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
                this.meetingsByYearAndMonth[meetingYear][meetingMonth] = monthOfMeeting.filter((m) => {
                    console.log('filtering');
                    return m.id != meetingId;
                });
            }

            //remove the meeting from meetingsById
            delete this.meetingsById[meetingId];
        }
    }

    updateMeeting(id:string, title:string, startDateTime:string, duration:number) {
        return new Promise<string>((resolve, reject) => {
            const startDTMillis = DateTime.fromISO(startDateTime).toMillis();
            const meetingUpdateDTO = new MeetingUpdateDTO(id, title, startDTMillis, duration);
            this.http.put('/api/users/update_meeting', meetingUpdateDTO, {observe: 'response'}).subscribe({
                next: (responseData:any) => {
                    this.updateMeetingLocally(id, title, startDateTime, duration);
                    this.meetingsModified.emit();
                    const result = responseData.status == 207 ? 
                        `The meeting was updated but we could not reach the following guests to notify them: ${responseData.body.unreachableEmailAddresses.join(", ")}` :
                        'The meeting was successfully updated and your guests have been notified via email.'
                    resolve(result);
                },
                error: (error) => {
                    reject(error.message);
                }   
            });
        });
    }

    updateMeetingLocally(id:string, title:string, startDateTime:string, duration:number) {
        const originalMeeting = this.meetingsById[id];
        if(originalMeeting) {
            //if the meeting's starting time changed, update it in upcoming meetings and meetingsByYearAndMonth
            if(startDateTime != originalMeeting.startDateTime) {

                //reload upcoming meetings
                this.loadUpcomingMeetings();

                //update meetingsByMonthAndYear
                const originalStartDateTime = DateTime.fromISO(originalMeeting.startDateTime);
                const newStartDateTime = DateTime.fromISO(startDateTime);

                const originalYear = String(originalStartDateTime.year);
                const originalMonth = originalStartDateTime.monthLong;
                const newYear = String(newStartDateTime.year);
                const newMonth = newStartDateTime.monthLong;

                if(originalYear != newYear || originalMonth != newMonth) {
                    //remove the old reference to the meeting if it has been loaded by loadMeetingsByYearAndMonth (via the calendar)
                    if(this.meetingsByYearAndMonth[originalYear] && this.meetingsByYearAndMonth[originalYear][originalMonth]) {
                        this.meetingsByYearAndMonth[originalYear][originalMonth] = this.meetingsByYearAndMonth[originalYear][originalMonth].filter((m) => {
                            return m.id != id;
                        });
                    }
                    //add the reference to the updated meeting to the correct year and month if that year and month has already been loaded
                    if(this.meetingsByYearAndMonth[newYear] && this.meetingsByYearAndMonth[newYear][newMonth]) {
                        this.meetingsByYearAndMonth[newYear][newMonth].push(originalMeeting);
                    }
                }
            }

            //update the values in the originalMeeting object
            originalMeeting.title = title;
            originalMeeting.startDateTime = startDateTime;
            originalMeeting.duration = duration;

        }
    }

}
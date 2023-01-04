import { EventEmitter } from "@angular/core";
import { DateTime } from "luxon";
import { MeetingDTO } from "src/app/models/meeting-dto.model";
import { Meeting } from "src/app/models/meeting.model";
import { MeetingsById } from "src/app/types/meetings-by-id.type";
import { MeetingsByYearAndMonth } from "src/app/types/meetings-by-year-and-month.type";
import { UpcomingMeetings } from "src/app/types/upcoming-meetings.type";
import { getMonthStr } from "src/app/utils/datetime.util";

export class MeetingsServiceStub {

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

    //this should search a local hashmap of meetings by id before requesting data from the server
    public getMeetingById(meetingId:string) {
    }

    //need guards for years and months greater than 4 and 2 digits long and outside the acceptable range
    public loadMeetingsByMonthAndYear(month:number, year:number) {
    }


    createMeeting(newMeetingDTO:MeetingDTO) {
    }

    addMeetingToMeetingsById(meeting:Meeting) {
    }

    addMeetingToUpcomingMeetings(meeting:Meeting) {
    }

    addMeetingToMeetingsByYearAndMonth(meeting:Meeting) {
    }

    deleteMeeting(meetingId:string) {
    }

    deleteMeetingLocally(meetingId:string) {
    }

    updateMeeting(id:string, title:string, startDateTime:string, duration:number) {
    }

    updateMeetingLocally(id:string, title:string, startDateTime:string, duration:number) {
    }

}
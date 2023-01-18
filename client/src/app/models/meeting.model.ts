import { DateTime } from "luxon";

export class Meeting {
    constructor(
        public id:string, 
        public title:string, 
        public password:string, 
        public duration:number, 
        public startDateTime:string,
        public guests:string[],
        public ownerId:string
    ) {}

    public getTime() {
        const startDT = DateTime.fromISO(this.startDateTime);
        return startDT.toFormat('h:mm a');
    }

    public getDate() {
        const startDT = DateTime.fromISO(this.startDateTime);
        return startDT.toFormat('MM/dd/yyyy');
    }

    public static fromMeetingObjectWithDTInMillis(meetingObj:any) {
        const meetingStartDTString = DateTime.fromMillis(meetingObj.startDateTime).toISO();
        return new Meeting(meetingObj.id, meetingObj.title, meetingObj.password, meetingObj.duration, meetingStartDTString, meetingObj.guests, meetingObj.ownerId);
    }
}
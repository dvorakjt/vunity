export class MeetingDTO {
    title?:string;
    dateTime?:string;
    duration?:number;
    password?:string;

    constructor({title, dateTime, duration, password}:any, public guests:string[]) {
        this.title = title;
        this.dateTime = dateTime;
        this.duration = duration;
        this.password = password;
    }
}
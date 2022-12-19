export class MeetingDTO {
    title?:string;
    startDateTime?:number;
    duration?:number;
    password?:string;

    constructor(title:string, startDateTime:number, duration:number, password:string, public guests:string[]) {
        this.title = title;
        this.startDateTime = startDateTime;
        this.duration = duration;
        this.password = password;
    }
}
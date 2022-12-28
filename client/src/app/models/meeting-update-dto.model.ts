export class MeetingUpdateDTO {
    id:string;
    title:string;
    startDateTime:number;
    duration:number;

    constructor(id:string, title:string, startDateTime:number, duration:number) {
        this.id = id;
        this.title = title;
        this.startDateTime = startDateTime;
        this.duration = duration;
    }
}
import { Meeting } from "../models/meeting.model";

export type SelectedDate = {
    date:number;
    month?:number;
    year?:number;
    meetings:Meeting[];
}
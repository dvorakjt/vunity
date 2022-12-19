import { Meeting } from "../models/meeting.model"

export type MeetingsByYearAndMonth = {
    [key:string] : { //year
        [key:string] : //month
            Meeting[]
    }
}
import { Meeting } from "../models/meeting.model"

export type MeetingsById = {
    [key:string] : Meeting
}
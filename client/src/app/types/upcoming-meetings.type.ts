import { Meeting } from "../models/meeting.model";

export type UpcomingMeetings = {
    today:Meeting[];
    tomorrow:Meeting[];
    laterThisWeek:Meeting[];
}
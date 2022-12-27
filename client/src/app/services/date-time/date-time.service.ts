import { Injectable } from "@angular/core";
import { DateTime } from "luxon";
import { getTimezoneOffsetString } from "src/app/utils/datetime.util";

@Injectable({providedIn: 'root'})
export class DateTimeService {
    public timeZoneShort;
    private timeZoneOffset;

    constructor() {
        this.timeZoneShort = new Date()
        .toLocaleDateString('en-US', {
            day: '2-digit',
            timeZoneName: 'short',
        })
        .slice(4);

        this.timeZoneOffset = getTimezoneOffsetString();
    }

    getTimeInMillis(startDTStr:string) {
        const startDT = DateTime.fromISO(startDTStr + this.timeZoneOffset);
        return startDT.toMillis();
    }
}
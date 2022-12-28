import { Injectable } from "@angular/core";
import { DateTime } from "luxon";
import { getTimezoneOffsetString } from "src/app/utils/datetime.util";

@Injectable({providedIn: 'root'})
export class DateTimeService {
    public timeZoneShort;

    constructor() {
        this.timeZoneShort = new Date()
        .toLocaleDateString('en-US', {
            day: '2-digit',
            timeZoneName: 'short',
        })
        .slice(4);
    }

    getTimeInMillis(startDTStr:string) {
        const startDT = DateTime.fromISO(startDTStr);
        console.log(startDT.toLocaleString(DateTime.DATETIME_MED));
        console.log(startDT.zoneName);
        return startDT.toMillis();
    }

    convertToFormInputValue(startDTStr:string) {
        const startDT = DateTime.fromISO(startDTStr);
        const formCompatibleDTStr = startDT.toISO({includeOffset: false, suppressSeconds: true, suppressMilliseconds: true});
        return formCompatibleDTStr;
    }
}
import { Component, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { Meeting } from '../models/meeting.model';
import { AuthService } from '../services/auth/auth.service';
import { MeetingsService } from '../services/meetings/meetings.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  public currentMonth = DateTime.now().month;
  public currentYear = DateTime.now().year;
  public currentMonthName = DateTime.now().monthLong;
  public days = this.initializeDays(this.currentMonth, this.currentYear);
  public previousMonthDays = new Array(DateTime.now().startOf('month').weekday - 1);
  public nextMonthDays = new Array(7 - DateTime.now().endOf('month').weekday);

  constructor(private auth:AuthService, private meetingsService:MeetingsService) {}

  ngOnInit(): void {
    this.populateDays(this.currentMonth, this.currentYear, this.days).then(() => {
      console.log(this.days);
    }).catch((e) => {
      console.log(e);
    });
  }

  initializeDays(month:number, year:number) {
    const startOfMonth = DateTime.fromObject({year, month, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0});
    const endOfMonth = startOfMonth.endOf('month');
    const days = [];
    for(let i = startOfMonth.day; i <= endOfMonth.day; i++) {
      days.push(new Array<Meeting>());
    }
    return days;
  }

  populateDays(month:number, year:number, days:Meeting[][]) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const meetingsThisMonth = await this.meetingsService.loadMeetingsByMonthAndYear(month, year);
        meetingsThisMonth.forEach(meeting => {
          const startDateTime = DateTime.fromISO(meeting.startDateTime);
          const day = startDateTime.day;
          days[day - 1].push(meeting);
        });
        resolve();
      } catch(e) {
        reject(e);
      }
    });
  }

  onGotoPreviousMonth() {
    const previousMonthDT = DateTime.fromObject({year: this.currentYear, month: this.currentMonth}).startOf('month').minus({days: 1});
    this.currentMonth = previousMonthDT.month;
    this.currentYear = previousMonthDT.year;
    this.currentMonthName = previousMonthDT.monthLong;
    this.days = this.initializeDays(this.currentMonth, this.currentYear);
    this.previousMonthDays = new Array(previousMonthDT.startOf('month').weekday - 1);
    this.nextMonthDays = new Array(7 - previousMonthDT.endOf('month').weekday);
    this.populateDays(this.currentMonth, this.currentYear, this.days).then(() => {
      console.log(this.days);
    }).catch((e) => {
      console.log(e);
    });
  }

  onGotoNextMonth() {
    const nextMonthDT = DateTime.fromObject({year: this.currentYear, month: this.currentMonth}).endOf('month').plus({days: 1});
    this.currentMonth = nextMonthDT.month;
    this.currentYear = nextMonthDT.year;
    this.currentMonthName = nextMonthDT.monthLong;
    this.days = this.initializeDays(this.currentMonth, this.currentYear);
    this.previousMonthDays = new Array(nextMonthDT.startOf('month').weekday - 1);
    this.nextMonthDays = new Array(7 - nextMonthDT.endOf('month').weekday);
    this.populateDays(this.currentMonth, this.currentYear, this.days).then(() => {
      console.log(this.days);
    }).catch((e) => {
      console.log(e);
    });
  }
}

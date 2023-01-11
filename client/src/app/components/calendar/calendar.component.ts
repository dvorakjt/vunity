import { Component, EventEmitter, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { DateTime } from 'luxon';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { Meeting } from '../../models/meeting.model';
import { AuthService } from '../../services/auth/auth.service';
import { MeetingsService } from '../../services/meetings/meetings.service';
import { SelectedDate } from 'src/app/types/selected-date.type';
import { ViewDateService } from 'src/app/services/view-date/view-date.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  public today = DateTime.now();
  public currentMonth = this.today.month;
  public currentYear = this.today.year;
  public currentMonthName = this.today.monthLong;
  public days = this.initializeDays(this.currentMonth, this.currentYear);
  public previousMonthDays = this.getPreviousMonthDays(this.today);
  public nextMonthDays = this.getNextMonthDays(this.today);
  public selectedMonth = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;

  @Output() dateSelected = new EventEmitter<SelectedDate>();

  faAngleLeft = faAngleLeft;
  faAngleRight = faAngleRight;

  constructor( 
    public meetingsService:MeetingsService, 
    public viewDateService:ViewDateService,
  ) {}

  ngOnInit(): void {
    this.populateDays(this.currentMonth, this.currentYear, this.days);
    this.meetingsService.meetingsModified.subscribe(() => {
      this.days = this.initializeDays(this.currentMonth, this.currentYear);
      this.populateDays(this.currentMonth, this.currentYear, this.days);
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
        meetingsThisMonth && meetingsThisMonth.forEach(meeting => {
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
    this.selectedMonth = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
    this.days = this.initializeDays(this.currentMonth, this.currentYear);
    this.previousMonthDays = this.getPreviousMonthDays(previousMonthDT);
    this.nextMonthDays = this.getNextMonthDays(previousMonthDT);
    this.populateDays(this.currentMonth, this.currentYear, this.days);
  }

  onGotoNextMonth() {
    const nextMonthDT = DateTime.fromObject({year: this.currentYear, month: this.currentMonth}).endOf('month').plus({days: 1});
    this.currentMonth = nextMonthDT.month;
    this.currentYear = nextMonthDT.year;
    this.currentMonthName = nextMonthDT.monthLong;
    this.selectedMonth = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
    this.days = this.initializeDays(this.currentMonth, this.currentYear);
    this.previousMonthDays = this.getPreviousMonthDays(nextMonthDT);
    this.nextMonthDays = this.getNextMonthDays(nextMonthDT);
    this.populateDays(this.currentMonth, this.currentYear, this.days);
  }

  onSelectMonth() {
    const [year, month] = this.selectedMonth.split('-');
    const newSelectedMonth = DateTime.fromObject({year : Number(year), month: Number(month)});
    this.currentMonth = newSelectedMonth.month;
    this.currentYear = newSelectedMonth.year;
    this.currentMonthName = newSelectedMonth.monthLong;
    this.days = this.initializeDays(this.currentMonth, this.currentYear);
    this.previousMonthDays = this.getPreviousMonthDays(newSelectedMonth);
    this.nextMonthDays = this.getNextMonthDays(newSelectedMonth);
    this.populateDays(this.currentMonth, this.currentYear, this.days);
  }

  getPreviousMonthDays(dateTime:DateTime) {
    return new Array(dateTime.startOf('month').weekday === 7 ? 0 : dateTime.startOf('month').weekday);
  }

  getNextMonthDays(dateTime:DateTime) {
    return new Array(6 - (dateTime.endOf('month').weekday === 7 ? 0 : dateTime.endOf('month').weekday));
  }

  onDateSelected(partialSelectedDate:SelectedDate) {
    const fullSelectedDate = {
      date: partialSelectedDate.date,
      year: this.currentYear,
      month: this.currentMonth,
      meetings: partialSelectedDate.meetings
    }
    this.viewDateService.selectedDate = fullSelectedDate;
    this.dateSelected.emit(fullSelectedDate);
  }
} 
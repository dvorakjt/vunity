import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DateTime } from 'luxon';
import { Meeting } from 'src/app/models/meeting.model';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { ViewDateService } from 'src/app/services/view-date/view-date.service';
import { MeetingsServiceStub } from 'src/app/tests/mocks/MeetingsServiceStub';
import { SelectedDate } from 'src/app/types/selected-date.type';

import { CalendarComponent } from './calendar.component';

describe('CalendarComponent', () => {
  let component: CalendarComponent;

  beforeEach(async () => {
    component = new CalendarComponent(new MeetingsServiceStub() as MeetingsService, new ViewDateService());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly initialize days.', () => {
    component.today = DateTime.fromObject({year: 1991, month: 6, day: 30}).startOf('day');
    component.currentMonth = component.today.month;
    component.currentYear = component.today.year;
    component.days = component.initializeDays(component.currentMonth, component.currentYear);
    expect(component.days.length).toBe(30);
  });

  it('should correctly get the previous month\'s days.', () => {
    const today = DateTime.fromObject({year: 1955, month: 4, day: 27}).startOf('day');
    expect(component.getPreviousMonthDays(today).length).toBe(5);
  });

  it('should correctly get the next month\'s days', () => {
    const today = DateTime.fromObject({year: 1955, month: 9, day: 21}).startOf('day');
    expect(component.getNextMonthDays(today).length).toBe(1);
  });

  it('should correctly populate the current month\'s days with meetings.', fakeAsync(() => {
    const meeting1 = new Meeting("1", "My first meeting", "password1", 60, DateTime.fromObject({year: 1988, month: 8, day: 21}).toISO(), [], "1");
    const meeting2 = new Meeting("2", "My second meeting", "password2", 45, DateTime.fromObject({year: 1988, month: 8, day: 12}).toISO(), [], "1");
    const meetings:Meeting[] = [meeting1, meeting2];
    spyOn(component.meetingsService, 'loadMeetingsByMonthAndYear').and.resolveTo(meetings);
    const days:Meeting[][] = new Array(31);
    for(let i = 0; i < days.length; i++) days[i] = new Array();
    component.populateDays(8, 1988, days);
    tick();
    expect(days[20][0]).toEqual(meeting1);
    expect(days[11][0]).toEqual(meeting2);
  }));

  it('should correctly populate the previous month\'s days', fakeAsync(() => {
    const meeting1 = new Meeting("1", "My first meeting", "password1", 60, DateTime.fromObject({year: 2021, month: 2, day: 14, hour: 17}).toISO(), [], "1");
    const meeting2 = new Meeting("2", "My second meeting", "password2", 45, DateTime.fromObject({year: 2021, month: 2, day: 14, hour: 19}).toISO(), [], "1");
    const meetings:Meeting[] = [meeting1, meeting2];
    spyOn(component.meetingsService, 'loadMeetingsByMonthAndYear').and.resolveTo(meetings);

    component.currentMonth = 3;
    component.currentYear = 2021;

    component.onGotoPreviousMonth();

    tick();

    expect(component.days[13][0]).toEqual(meeting1);
    expect(component.days[13][1]).toEqual(meeting2);
  }));

  it('should correctly populate the next month\'s days', fakeAsync(() => {
    const meeting1 = new Meeting("1", "My first meeting", "password1", 60, DateTime.fromObject({year: 2021, month: 1, day: 1, hour: 0}).toISO(), [], "1");
    const meeting2 = new Meeting("2", "My second meeting", "password2", 45, DateTime.fromObject({year: 2021, month: 1, day: 1, hour: 12}).toISO(), [], "1");
    const meetings:Meeting[] = [meeting1, meeting2];
    spyOn(component.meetingsService, 'loadMeetingsByMonthAndYear').and.resolveTo(meetings);

    component.currentMonth = 12;
    component.currentYear = 2020;

    component.onGotoNextMonth();

    tick();

    expect(component.days[0][0]).toEqual(meeting1);
    expect(component.days[0][1]).toEqual(meeting2);
  }));

  it('should correctly populate a selected month\'s days', fakeAsync(() => {
    const meeting1 = new Meeting("1", "My first meeting", "password1", 60, DateTime.fromObject({year: 2023, month: 1, day: 1, hour: 0}).toISO(), [], "1");
    const meeting2 = new Meeting("2", "My second meeting", "password2", 45, DateTime.fromObject({year: 2023, month: 1, day: 1, hour: 12}).toISO(), [], "1");
    const meetings:Meeting[] = [meeting1, meeting2];
    spyOn(component.meetingsService, 'loadMeetingsByMonthAndYear').and.resolveTo(meetings);
    component.selectedMonth = '2023-01';
    component.onSelectMonth();
    tick();
    expect(component.days[0][0]).toEqual(meeting1);
    expect(component.days[0][1]).toEqual(meeting2);
  }));

  it('should emit a selected date when a onDateSelected() is called', () => {
    spyOn(component.dateSelected, 'emit');
    component.currentYear = 2023;
    component.currentMonth = 1;
    const partialSelectedDate:SelectedDate = {
      date: 4,
      meetings: []
    }
    component.onDateSelected(partialSelectedDate);
    expect(component.dateSelected.emit).toHaveBeenCalledWith({
      date: 4,
      month: 1,
      year: 2023,
      meetings: []
    });
  });
});

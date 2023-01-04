import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateTime } from 'luxon';
import { Meeting } from 'src/app/models/meeting.model';

import { CalendarDateComponent } from './calendar-date.component';

describe('CalendarDateComponent', () => {
  let component: CalendarDateComponent;
  let fixture: ComponentFixture<CalendarDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalendarDateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the date', () => {
    component.date = 1;
    fixture.detectChanges();
    const dateElement = fixture.nativeElement.querySelector('small');
    expect(dateElement.textContent).toBe('1');
  });

  it('should render a meeting as an li.', () => {
    const meeting = new Meeting("1", "Meeting Title", "password", 60, DateTime.fromObject({year: 1988, month: 8, day: 21, hour: 14, minute: 5}).toISO(), ["guest@example.com", "guest2@example.com"], "1");
    const meetings = [meeting];
    component.meetings = meetings;
    fixture.detectChanges();
    const li = fixture.nativeElement.querySelector('li');
    expect(li.textContent.trim()).toBe('2:05 PM Meeting Title');
  });

  it('should not render a div with a class of moreMeetings when there are 4 or less meetings.', () => {
    const meeting = new Meeting("1", "Meeting Title", "password", 60, DateTime.fromObject({year: 1988, month: 8, day: 21, hour: 14, minute: 5}).toISO(), ["guest@example.com", "guest2@example.com"], "1");
    const meetings = new Array(4).fill(meeting);
    component.meetings = meetings;
    fixture.detectChanges();
    const moreMeetings = fixture.nativeElement.getElementsByClassName('hide')[0];
    expect(moreMeetings).toBeTruthy();
  });

  it('should render a div with a class of moreMeetings when there are 5 or more meetings.', () => {
    const meeting = new Meeting("1", "Meeting Title", "password", 60, DateTime.fromObject({year: 1988, month: 8, day: 21, hour: 14, minute: 5}).toISO(), ["guest@example.com", "guest2@example.com"], "1");
    const meetings = new Array(5).fill(meeting);
    component.meetings = meetings;
    fixture.detectChanges();
    const moreMeetings = fixture.nativeElement.getElementsByClassName('hide')[0];
    expect(moreMeetings).toBeFalsy();
  });

  it('should emit a date selected event when onClick is called.', () => {
    spyOn(component.dateSelected, 'emit');
    const meeting = new Meeting("1", "Meeting Title", "password", 60, DateTime.fromObject({year: 1988, month: 8, day: 21, hour: 14, minute: 5}).toISO(), ["guest@example.com", "guest2@example.com"], "1");
    const meetings = [meeting];
    component.date = 1;
    component.meetings = meetings;
    component.onClick();
    expect(component.dateSelected.emit).toHaveBeenCalledWith({
      date: 1,
      meetings: meetings
    });
  });

  it('should call onClick when it is clicked.', () => {
    spyOn(component, 'onClick');
    fixture.nativeElement.querySelector('div').click();
    expect(component.onClick).toHaveBeenCalled();
  });
});

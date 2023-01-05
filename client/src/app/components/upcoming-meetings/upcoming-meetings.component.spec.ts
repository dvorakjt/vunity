import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateTime } from 'luxon';
import { Meeting } from 'src/app/models/meeting.model';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { DateTimeServiceStub } from 'src/app/tests/mocks/DateTimeServiceStub';
import { MeetingsServiceStub } from 'src/app/tests/mocks/MeetingsServiceStub';

import { UpcomingMeetingsComponent } from './upcoming-meetings.component';

describe('UpcomingMeetingsComponent', () => {
  let component: UpcomingMeetingsComponent;
  let fixture: ComponentFixture<UpcomingMeetingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpcomingMeetingsComponent ],
      providers: [
        {provide: MeetingsService, useClass: MeetingsServiceStub},
        {provide: DateTimeService, useClass: DateTimeServiceStub}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpcomingMeetingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit an event when onNewMeeting is called.', () => {
    spyOn(component.newMeetingButtonClicked, 'emit');
    component.onNewMeeting();
    expect(component.newMeetingButtonClicked.emit).toHaveBeenCalled();
  });

  it('should call onNewMeeting when the new meeting button is clicked.', () => {
    spyOn(component, 'onNewMeeting');
    const newMeetingButton = fixture.nativeElement.querySelector('button');
    newMeetingButton.click();
    expect(component.onNewMeeting).toHaveBeenCalled();
  });

  it('should render today\'s meetings and call onMeetingSelected when the details button is clicked.', () => {
    spyOn(component, 'onMeetingSelected');
    const meeting = new Meeting (
      '1', 
      'Land on the Moon', 
      'Apollo 11', 
      13, 
      DateTime.fromObject({year: 1969, month: 7, day: 20, hour: 20, minute: 5}).toISO(), 
      ['Neil Armstrong', 'Buzz Aldrin', 'Michael Collins', 'Charles Duke', 'Pete Conrad'],
      "1"
    );
    component.meetingsService.upcomingMeetings.today = [meeting];
    fixture.detectChanges();
    const meetingTitle = fixture.nativeElement.querySelector('h3');
    expect(meetingTitle.textContent).toBe('Land on the Moon');

    const detailsButton = fixture.nativeElement.getElementsByClassName('btnPrimary')[0];
    detailsButton.click();

    expect(component.onMeetingSelected).toHaveBeenCalledWith(meeting);
  });

  it('should render tomorrow\'s meetings and call onMeetingSelected when the details button is clicked.', () => {
    spyOn(component, 'onMeetingSelected');
    const meeting = new Meeting (
      '1', 
      'Land on the Moon', 
      'Apollo 11', 
      13, 
      DateTime.fromObject({year: 1969, month: 7, day: 20, hour: 20, minute: 5}).toISO(), 
      ['Neil Armstrong', 'Buzz Aldrin', 'Michael Collins', 'Charles Duke', 'Pete Conrad'],
      "1"
    );
    component.meetingsService.upcomingMeetings.tomorrow = [meeting];
    fixture.detectChanges();
    const meetingTitle = fixture.nativeElement.querySelector('h3');
    expect(meetingTitle.textContent).toBe('Land on the Moon');

    const detailsButton = fixture.nativeElement.getElementsByClassName('btnPrimary')[0];
    detailsButton.click();
    expect(component.onMeetingSelected).toHaveBeenCalledWith(meeting);
  });

  it('should render meetings later in the week and call onMeetingSelected when the details button is clicked.', () => {
    spyOn(component, 'onMeetingSelected');
    const meeting = new Meeting (
      '1', 
      'Land on the Moon', 
      'Apollo 11', 
      13, 
      DateTime.fromObject({year: 1969, month: 7, day: 20, hour: 20, minute: 5}).toISO(), 
      ['Neil Armstrong', 'Buzz Aldrin', 'Michael Collins', 'Charles Duke', 'Pete Conrad'],
      "1"
    );
    component.meetingsService.upcomingMeetings.laterThisWeek = [meeting];
    fixture.detectChanges();
    const meetingTitle = fixture.nativeElement.querySelector('h3');
    expect(meetingTitle.textContent).toBe('Land on the Moon');

    const detailsButton = fixture.nativeElement.getElementsByClassName('btnPrimary')[0];
    detailsButton.click();
    expect(component.onMeetingSelected).toHaveBeenCalledWith(meeting);
  });

  it('should emit an event when onMeetingSelected is called.', () => {
    spyOn(component.meetingSelected, 'emit');

    const meeting = new Meeting (
      '1', 
      'Land on the Moon', 
      'Apollo 11', 
      13, 
      DateTime.fromObject({year: 1969, month: 7, day: 20, hour: 20, minute: 5}).toISO(), 
      ['Neil Armstrong', 'Buzz Aldrin', 'Michael Collins', 'Charles Duke', 'Pete Conrad'],
      "1"
    );
    component.onMeetingSelected(meeting);

    expect(component.meetingSelected.emit).toHaveBeenCalledWith(meeting);
  });
});

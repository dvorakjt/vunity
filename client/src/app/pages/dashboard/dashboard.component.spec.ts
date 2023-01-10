import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateTime } from 'luxon';
import { CalendarComponent } from 'src/app/components/calendar/calendar.component';
import { UpcomingMeetingsComponent } from 'src/app/components/upcoming-meetings/upcoming-meetings.component';
import { Meeting } from 'src/app/models/meeting.model';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { ViewDateService } from 'src/app/services/view-date/view-date.service';
import { MeetingsServiceStub } from 'src/app/tests/mocks/MeetingsServiceStub';
import { ViewDateServiceStub } from 'src/app/tests/mocks/ViewMeetingServiceStub';

import { DashboardComponent } from './dashboard.component';
import { Modals } from './modals.enum';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: DateTimeService},
        {provide: ViewDateService, useClass: ViewDateServiceStub},
        {provide: MeetingsService, useClass: MeetingsServiceStub}
      ],
      declarations: [ DashboardComponent, UpcomingMeetingsComponent, CalendarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display the modalContainer or the modal if modalToShow is Modals.None', () => {
    component.modalToShow = Modals.None;
    fixture.detectChanges();
    expect(fixture.nativeElement.getElementsByClassName('modalContainer').length).toBe(0);
    expect(fixture.nativeElement.getElementsByClassName('modal').length).toBe(0);
  });

  it('shoulddisplay not display the modalContainer or the modal if modalToShow is not Modals.None', () => {
    component.modalToShow = Modals.NewMeeting;
    fixture.detectChanges();
    expect(fixture.nativeElement.getElementsByClassName('modalContainer').length).toBe(1);
    expect(fixture.nativeElement.getElementsByClassName('modal').length).toBe(1);
  });

  it('should render the new meeting component if modalToShow is Modals.NewMeeting.', () => {
    component.modalToShow = Modals.NewMeeting;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-new-meeting')).toBeTruthy();
  });

  it('should render the view and edit meeting component if modalToShow is Modals.ViewAndEditMeeting', () => {
    component.modalToShow = Modals.ViewAndEditMeeting;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-view-and-edit-meeting')).toBeTruthy();
  });

  it('should render the date view component if modalToShow is Modals.ViewDate', () => {
    component.modalToShow = Modals.ViewDate;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-date-view')).toBeTruthy();
  });

  it('should set modalToShow to Modals.NewMeeting and dateToCreateMeetingOn to "" when onShowNewMeetingModal is called.', () => {
    component.onShowNewMeetingModal();
    expect(component.dateToCreateMeetingOn).toBe('');
    expect(component.modalToShow).toBe(Modals.NewMeeting);
  });

  it('should set selectedMeeting to the selected meeting & modalToShow to Modals.ViewAndEditMeeting when onViewMeeting is called.', () => {
    const meeting = new Meeting("1", "Title", "password", 50, DateTime.now().toISO(), [], "1");
    component.onViewMeeting(meeting);
    expect(component.selectedMeeting).toEqual(meeting);
    expect(component.modalToShow).toBe(Modals.ViewAndEditMeeting);
  });

  it('should set modalToShow to Modals.ViewDate when onViewDate is called.', () => {
    component.onViewDate();
    expect(component.modalToShow).toBe(Modals.ViewDate);
  });

  it('should set dateToCreateMeetingOn to the date argument and modalToShow to Modals.NewMeeting when onCreateMeetingFromCalendar is called.', () => {
    const date = DateTime.now().toISO();
    component.onCreateMeetingFromCalendar(date);
    expect(component.dateToCreateMeetingOn).toBe(date);
    expect(component.modalToShow).toBe(Modals.NewMeeting);
  });

  it('should set modalToShow to Modals.None when onCloseModal is called.', () => {
    component.onCloseModal();
    expect(component.modalToShow).toBe(Modals.None);
  });
});

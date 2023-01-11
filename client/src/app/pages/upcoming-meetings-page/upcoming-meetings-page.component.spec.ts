import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateTime } from 'luxon';
import { UpcomingMeetingsComponent } from 'src/app/components/upcoming-meetings/upcoming-meetings.component';
import { Meeting } from 'src/app/models/meeting.model';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { DateTimeServiceStub } from 'src/app/tests/mocks/DateTimeServiceStub';
import { MeetingsServiceStub } from 'src/app/tests/mocks/MeetingsServiceStub';

import { UpcomingMeetingsPageComponent } from './upcoming-meetings-page.component';

describe('UpcomingMeetingsPageComponent', () => {
  let component: UpcomingMeetingsPageComponent;
  let fixture: ComponentFixture<UpcomingMeetingsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: MeetingsService, useClass: MeetingsServiceStub},
        {provide: DateTimeService, useClass: DateTimeServiceStub}],
      declarations: [ UpcomingMeetingsPageComponent, UpcomingMeetingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpcomingMeetingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call router.navigateByUrl when onMeetingSelected is called.', () => {
    spyOn(component.router, 'navigateByUrl');
    const meeting = new Meeting("1", "Title", "password", 60, DateTime.now().toISO(), [], "2");
    component.onMeetingSelected(meeting);
    expect(component.router.navigateByUrl).toHaveBeenCalledWith('/meeting?id=1');
  });

  it('should call router.navigateByUrl when onNewMeeting is called.', () => {
    spyOn(component.router, 'navigateByUrl');
    component.onNewMeeting();
    expect(component.router.navigateByUrl).toHaveBeenCalledWith('/newmeeting');
  });
});

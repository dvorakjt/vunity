import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpcomingMeetingsComponent } from 'src/app/components/upcoming-meetings/upcoming-meetings.component';
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
});

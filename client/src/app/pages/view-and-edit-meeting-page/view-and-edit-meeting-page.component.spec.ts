import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DateTime } from 'luxon';
import { EditMeetingComponent } from 'src/app/components/edit-meeting/edit-meeting.component';
import { ViewAndEditMeetingComponent } from 'src/app/components/view-and-edit-meeting/view-and-edit-meeting.component';
import { ViewMeetingComponent } from 'src/app/components/view-meeting/view-meeting.component';
import { Meeting } from 'src/app/models/meeting.model';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { ActivatedRouteStub } from 'src/app/tests/mocks/ActivatedRouteStub';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';
import { LoadingServiceStub } from 'src/app/tests/mocks/LoadingServiceStub';
import { MeetingsServiceStub } from 'src/app/tests/mocks/MeetingsServiceStub';

import { ViewAndEditMeetingPageComponent } from './view-and-edit-meeting-page.component';

describe('ViewAndEditMeetingPageComponent', () => {
  let component: ViewAndEditMeetingPageComponent;
  let fixture: ComponentFixture<ViewAndEditMeetingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub},
        {provide: LoadingService, useClass: LoadingServiceStub},
        {provide: DateTimeService, useClass: DateTimeService},
        {provide: MeetingsService, useClass: MeetingsServiceStub},
        {provide: ActivatedRoute, useClass: ActivatedRouteStub}
      ],
      imports: [ReactiveFormsModule, FontAwesomeModule],
      declarations: [ ViewAndEditMeetingPageComponent, ViewAndEditMeetingComponent, ViewMeetingComponent, EditMeetingComponent ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAndEditMeetingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set this.meeting when ngOnInit is called and this.meetingId is a valid id.', fakeAsync(() => {
    const meeting = new Meeting("1", "Title", "password", 60, DateTime.now().toISO(), [], "2");
    spyOn(component.meetingsService, 'getMeetingById').and.returnValue(Promise.resolve(meeting));
    component.meetingId = "1";
    component.ngOnInit();
    tick();
    expect(component.meeting).toEqual(meeting);
  }));
});

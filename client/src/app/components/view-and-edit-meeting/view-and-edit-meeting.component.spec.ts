import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';
import { LoadingServiceStub } from 'src/app/tests/mocks/LoadingServiceStub';
import { MeetingsServiceStub } from 'src/app/tests/mocks/MeetingsServiceStub';
import { EditMeetingComponent } from '../edit-meeting/edit-meeting.component';
import { ViewMeetingComponent } from '../view-meeting/view-meeting.component';

import { ViewAndEditMeetingComponent } from './view-and-edit-meeting.component';

describe('ViewAndEditMeetingComponent', () => {
  let component: ViewAndEditMeetingComponent;
  let fixture: ComponentFixture<ViewAndEditMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub},
        {provide: LoadingService, useClass: LoadingServiceStub},
        {provide: DateTimeService, useClass: DateTimeService},
        {provide: MeetingsService, useClass: MeetingsServiceStub}
      ],
      imports: [ReactiveFormsModule, FontAwesomeModule],
      declarations: [ ViewAndEditMeetingComponent, ViewMeetingComponent, EditMeetingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAndEditMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render <app-view-meeting/> if !isEditing.', () => {
    const appViewMeeting = fixture.nativeElement.querySelector('app-view-meeting');
    expect(appViewMeeting).toBeTruthy();
  });

  it('should not render <app-edit-meeting/> if !isEditing.', () => {
    const appEditMeeting = fixture.nativeElement.querySelector('app-edit-meeting');
    expect(appEditMeeting).toBeFalsy();
  });

  it('should render <app-edit-meeting/> if isEditing.', () => {
    component.isEditing = true;
    fixture.detectChanges();
    const appEditMeeting = fixture.nativeElement.querySelector('app-edit-meeting');
    expect(appEditMeeting).toBeTruthy();
  });

  it('should not render <app-view-meeting/> if isEditing.', () => {
    component.isEditing = true;
    fixture.detectChanges();
    const appViewMeeting = fixture.nativeElement.querySelector('app-view-meeting');
    expect(appViewMeeting).toBeFalsy();
  });
});

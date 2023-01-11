import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeetingStatus } from 'src/app/constants/meeting-status';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';

import { StartMeetingPageComponent } from './start-meeting-page.component';

describe('StartMeetingPageComponent', () => {
  let component: StartMeetingPageComponent;
  let fixture: ComponentFixture<StartMeetingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub}
      ],
      declarations: [ StartMeetingPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartMeetingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render app-awaiting-user-media if activeMeetingService.meetingStatus is MeetingStatus.AwaitingMedia', () => {
    component.activeMeetingService.meetingStatus = MeetingStatus.AwaitingMedia;
    fixture.detectChanges();
    const appAwaitingUserMedia = fixture.nativeElement.querySelector('app-awaiting-user-media');
    expect(appAwaitingUserMedia).toBeTruthy();
  });

  it('should not render app-awaiting-user-media if activeMeetingService.meetingStatus is NOT MeetingStatus.AwaitingMedia', () => {
    component.activeMeetingService.meetingStatus = MeetingStatus.NotInMeeting;
    fixture.detectChanges();
    const appAwaitingUserMedia = fixture.nativeElement.querySelector('app-awaiting-user-media');
    expect(appAwaitingUserMedia).toBeFalsy();
  });

  it('should render app-get-user-media-settings if activeMeetingService.meetingStatus is MeetingStatus.AwaitingMediaSettings', () => {
    component.activeMeetingService.meetingStatus = MeetingStatus.AwaitingMediaSettings;
    fixture.detectChanges();
    const appGetUserMediaSettings = fixture.nativeElement.querySelector('app-get-user-media-settings');
    expect(appGetUserMediaSettings).toBeTruthy();
  });

  it('should not render app-get-user-media-settings if activeMeetingService.meetingStatus is NOT MeetingStatus.AwaitingMediaSettings', () => {
    component.activeMeetingService.meetingStatus = MeetingStatus.AwaitingMedia;
    fixture.detectChanges();
    const appGetUserMediaSettings = fixture.nativeElement.querySelector('app-get-user-media-settings');
    expect(appGetUserMediaSettings).toBeFalsy();
  });
});

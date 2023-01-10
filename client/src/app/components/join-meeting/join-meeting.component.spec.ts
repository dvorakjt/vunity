import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { of } from 'rxjs';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { GuestAuthError } from 'src/app/services/active-meeting/errors/guest-auth-error';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';
import { LoadingServiceStub } from 'src/app/tests/mocks/LoadingServiceStub';
import { RecaptchaV3ServiceStub } from 'src/app/tests/mocks/RecaptchaV3ServiceStub';

import { JoinMeetingComponent } from './join-meeting.component';

describe('JoinMeetingComponent', () => {
  let component: JoinMeetingComponent;
  let fixture: ComponentFixture<JoinMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoinMeetingComponent ],
      imports: [FormsModule],
      providers: [
        {provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub},
        {provide: LoadingService, useClass: LoadingServiceStub},
        {provide: ReCaptchaV3Service, useClass: RecaptchaV3ServiceStub}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set fail to call activeMeetingService.authenticateAsGuest and should set the meetingIdErrorMessage when no meeting id is entered.', () => {
    spyOn(component.activeMeetingService, 'authenticateAsGuest');

    component.meetingId = '';
    component.password = 'test';

    component.onAuthenticateToMeeting();

    expect(component.meetingIdErrorMessage).toBe('Please enter a meeting id.');
    expect(component.activeMeetingService.authenticateAsGuest).not.toHaveBeenCalled();
  });

  it('should fail to call activeMeetingService.authenticateAsGuest and should set the passwordErrorMessage when no password is entered.', () => {
    spyOn(component.activeMeetingService, 'authenticateAsGuest');

    component.meetingId = 'test';
    component.password = '';

    component.onAuthenticateToMeeting();

    expect(component.passwordErrorMessage).toBe('Please enter a password.');
    expect(component.activeMeetingService.authenticateAsGuest).not.toHaveBeenCalled();
  });

  it('should call activeMeetingService.authenticateAsGuest when a meetingId and password is provided.', () => {
    spyOn(component.recaptchaV3Service, 'execute').and.returnValue(of('token'));
    spyOn(component.activeMeetingService, 'authenticateAsGuest');

    component.meetingId = '1';
    component.password = 'password';

    component.onAuthenticateToMeeting();

    expect(component.activeMeetingService.authenticateAsGuest).toHaveBeenCalled();
  });

  it('should set loadingService.isLoading to false when activeMeeting.meetingStatusChanged emits an event.', () => {
    spyOn(component.recaptchaV3Service, 'execute').and.returnValue(of('token'));

    component.meetingId = '1';
    component.password = 'password';
    component.onAuthenticateToMeeting();

    expect(component.loadingService.isLoading).toBe(true);

    component.activeMeetingService.meetingStatusChanged.emit();

    expect(component.loadingService.isLoading).toBe(false); 
  });

  it('should set loadingService.isLoading to false and set the serverErrorMessage when activeMeeting.errorEmitter emits a GuestAuthError', () => {
    spyOn(component.recaptchaV3Service, 'execute').and.returnValue(of('token'));
    component.meetingId = '1';
    component.password = 'some wrong password';
    component.onAuthenticateToMeeting();
    component.activeMeetingService.errorEmitter.emit(new GuestAuthError('auth failed.'));
    expect(component.loadingService.isLoading).toBe(false);
    expect(component.serverErrorMessage).toBe('auth failed.');
  });
});

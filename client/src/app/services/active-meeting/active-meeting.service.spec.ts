import { HttpClient } from "@angular/common/http";
import { of, throwError } from "rxjs";
import { MeetingStatus } from "src/app/constants/meeting-status";
import { AuthServiceStub } from "src/app/tests/mocks/AuthServiceStub";
import { HttpClientStub } from "src/app/tests/mocks/HttpClientStub";
import { AuthService } from "../auth/auth.service";
import { ActiveMeetingService } from "./active-meeting.service";
import { GuestAuthError } from "./errors/guest-auth-error";

describe('ActiveMeetingService', () => {
    let service:ActiveMeetingService;

    beforeEach(() => {
        service = new ActiveMeetingService((new AuthServiceStub() as any) as AuthService, new HttpClientStub() as HttpClient);
    });

    it('should set authToken and call updateMeetingStatus when authenticateAsGuest succeeds.', () => {
        spyOn(service.http, 'post').and.returnValue(of({access_token:'meetingJWT'}));
        spyOn(service, 'updateMeetingStatus');
        service.meetingStatus = MeetingStatus.NotInMeeting;
        service.authenticateAsGuest('validMeetingId', 'password', 'recaptchaToken');
        expect(service.authToken).toBe('meetingJWT');
        expect(service.updateMeetingStatus).toHaveBeenCalledWith(MeetingStatus.AwaitingUsernameInput);
    });

    it('should call handleError with new GuestAuthError if authenticateAsGuest is called while in a meeting.', () => {
        spyOn(service, 'handleError');
        service.meetingStatus = MeetingStatus.InMeeting;
        service.authenticateAsGuest('1234', 'password', 'recaptchaToken');
        expect(service.handleError).toHaveBeenCalledWith(new GuestAuthError('Already in a meeting.'));
    });

    it('should call handleError with new GuestAuthError if http post method fails.', () => {
        spyOn(service.http, 'post').and.returnValue(throwError({status:403}));
        spyOn(service, 'handleError');
        service.meetingStatus = MeetingStatus.NotInMeeting;
        service.authenticateAsGuest('1234', 'wrongPassword', 'recaptchaToken');
        expect(service.handleError).toHaveBeenCalledWith(new GuestAuthError('Failed to join meeting. Please check the id and password.'));
    });

    it('should set isHost to true, authToken, call createLocalPeer, updateMeetingStatus and getLocalMedia when authenticateAsHost post request succeeds and there is an activeUser.', () => {
        spyOn(service.http, 'post').and.returnValue(of({access_token: "meetingJWT"}));
        spyOn(service, 'createLocalPeer');
        spyOn(service, 'updateMeetingStatus');
        spyOn(service, 'getLocalMedia');
        service.authService.activeUser = {name: 'Host', email: 'host@vunity.com'};
        service.authenticateAsHost('validMeetingId');
        expect(service.isHost).toBeTrue();
        expect(service.authToken).toBe('meetingJWT');
        expect(service.createLocalPeer).toHaveBeenCalledWith('Host');
        expect(service.updateMeetingStatus).toHaveBeenCalledWith(MeetingStatus.AwaitingMedia);
        expect(service.getLocalMedia).toHaveBeenCalled();
    });

    it('should call createLocalPeer, updateMeetingStatus and getLocalMedia when setLocalPeerUsername is called.', () => {
        spyOn(service, 'createLocalPeer');
        spyOn(service, 'updateMeetingStatus');
        spyOn(service, 'getLocalMedia');
        service.setLocalPeerUsername('username');
        expect(service.createLocalPeer).toHaveBeenCalledWith('username');
        expect(service.updateMeetingStatus).toHaveBeenCalledWith(MeetingStatus.AwaitingMedia);
        expect(service.getLocalMedia).toHaveBeenCalled();
    });
});
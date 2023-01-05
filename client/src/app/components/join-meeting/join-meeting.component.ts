import { Component, OnInit, Input } from '@angular/core';
import { MeetingStatus } from 'src/app/constants/meeting-status';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-join-meeting',
  templateUrl: './join-meeting.component.html',
  styleUrls: ['./join-meeting.component.scss']
})
export class JoinMeetingComponent implements OnInit {
  @Input() meetingId = '';
  password = '';
  meetingIdErrorMessage = '';
  passwordErrorMessage = '';
  serverErrorMessage = '';

  constructor(
    public activeMeetingService:ActiveMeetingService,
    public loadingService:LoadingService
  ) {}

  ngOnInit(): void {
      this.activeMeetingService.errorEmitter.subscribe({
        next: (e:Error) => {
          if(e.name === 'GuestAuthError') {
            this.loadingService.isLoading = false;
            this.serverErrorMessage = e.message;
          }
        }
      });
  }

  onAuthenticateToMeeting() {
    this.meetingIdErrorMessage = '';
    this.passwordErrorMessage = '';
    this.serverErrorMessage = '';
    let frontendValidationPassed = true;
    if (!this.meetingId) {
      this.meetingIdErrorMessage = 'Please enter a meeting id.';
      frontendValidationPassed = false;
    }
    if (!this.password) {
      this.passwordErrorMessage = 'Please enter a password.';
      frontendValidationPassed = false;
    }
    if (!frontendValidationPassed) return;
    this.loadingService.isLoading = true;
    this.activeMeetingService.meetingStatusChanged.subscribe({
      next: () => {
        this.loadingService.isLoading = false;
      }
    });
    this.activeMeetingService.authenticateAsGuest(this.meetingId, this.password);
  }
}

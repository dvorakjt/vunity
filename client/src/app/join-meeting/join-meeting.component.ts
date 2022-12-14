import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { MeetingStatus } from '../constants/meeting-status';
import { ActiveMeetingService } from '../services/active-meeting/active-meeting.service';

@Component({
  selector: 'app-join-meeting',
  templateUrl: './join-meeting.component.html',
  styleUrls: ['./join-meeting.component.scss',]
})
export class JoinMeetingComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();

  meetingId = '';
  password = '';
  meetingIdErrorMessage = '';
  passwordErrorMessage = '';
  serverErrorMessage = '';
  username = '';
  usernameErrorMessage = '';
  faTimes = faTimes;
  isLoading = false;
  modalToShow = 'authentication';

  constructor(private activeMeetingService:ActiveMeetingService) { }

  ngOnInit(): void {
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
    this.isLoading = true;
    this.activeMeetingService.meetingStatusChanged.subscribe({
      next: (meetingStatus: MeetingStatus) => {
        this.isLoading = false;
        if (meetingStatus === MeetingStatus.AwaitingUsernameInput) {
          this.modalToShow = 'username';
        } else if(meetingStatus === MeetingStatus.AwaitingMedia || meetingStatus === MeetingStatus.AwaitingMediaSettings) {
          this.modalToShow = 'media';
        } 
        else if (meetingStatus === MeetingStatus.Error) {
          this.serverErrorMessage = 'There was a problem authenticating to the meeting. Please ensure you have entered the correct credentials.'
        }
      }
    });
    this.activeMeetingService.authenticateAsGuest(this.meetingId, this.password);
  }

  onEnterUsername() {
    this.activeMeetingService.setLocalPeerUsername(this.username);
  }

  onCancel() {
    this.activeMeetingService.resetMeetingData();
    this.closeModal.emit();
  }

  onCloseSelf() {
    this.closeModal.emit();
  }

}

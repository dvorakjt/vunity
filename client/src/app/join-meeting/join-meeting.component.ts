import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SignalingService } from '../services/signaling/signaling.service';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { MeetingStatus } from '../services/signaling/meeting-status';

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

  constructor(private signalingService: SignalingService) { }

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
    this.signalingService.meetingStatusChanged.subscribe({
      next: (meetingStatus: MeetingStatus) => {
        this.isLoading = false;
        if (meetingStatus === MeetingStatus.AwaitingUsernameInput) {
          this.modalToShow = 'username'
        } else if (meetingStatus === MeetingStatus.Error) {
          this.serverErrorMessage = 'There was a problem authenticating to the meeting. Please ensure you have entered the correct credentials.'
        }
      }
    });
    this.signalingService.authenticateAsGuest(this.meetingId, this.password);
  }

  onEnterUsername() {
    this.signalingService.setUsername(this.username);
    this.modalToShow = 'media';
  }

  onCancel() {
    this.signalingService.resetMeetingData();
    this.closeModal.emit();
  }

  onCloseSelf() {
    this.closeModal.emit();
  }

}

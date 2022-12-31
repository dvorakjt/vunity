import { Component } from '@angular/core';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';

@Component({
  selector: 'app-get-username',
  templateUrl: './get-username.component.html',
  styleUrls: ['./get-username.component.scss']
})
export class GetUsernameComponent {
  username = '';
  usernameErrorMessage = '';
  formSubmissionError = '';

  constructor(private activeMeetingService:ActiveMeetingService) {}

  onSubmit() {
    if(!this.username) {
      this.usernameErrorMessage = 'Please enter a name';
      return;
    }
    this.activeMeetingService.setLocalPeerUsername(this.username);
  }
}

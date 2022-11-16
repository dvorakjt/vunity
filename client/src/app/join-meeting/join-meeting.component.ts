import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-join-meeting',
  templateUrl: './join-meeting.component.html',
  styleUrls: ['../styles/forms.scss']
})
export class JoinMeetingComponent implements OnInit {
  meetingId = '';
  password = '';
  meetingIdErrorMessage = '';
  passwordErrorMessage = '';
  serverErrorMessage = '';

  constructor() { }

  ngOnInit(): void {
  }

  onJoinMeeting() {
    this.serverErrorMessage = '';
    let failed = false;
    if(!this.meetingId.length) {
      this.meetingIdErrorMessage = 'Please enter your email address.';
      failed = true;
    }
    if(!this.password.length) {
      this.passwordErrorMessage = 'Please enter your password.';
      failed = true;
    }
    if(failed) return;
    const serverError = Math.random() >= 0.5;
    if(serverError) this.serverErrorMessage = 'There was a problem with the server. Please try again later.';
  }

}

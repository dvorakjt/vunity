import { Component, OnInit } from '@angular/core';
import { MeetingsService } from '../services/meetings/meetings.service';

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

  constructor(private meetingsService:MeetingsService) { }

  ngOnInit(): void {
  }

  onJoinMeeting() {
    this.meetingsService.joinMeeting(this.meetingId, this.password);
  }

}

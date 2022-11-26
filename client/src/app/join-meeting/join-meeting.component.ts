import { Component, OnInit } from '@angular/core';
import { MeetingsService } from '../services/meetings/meetings.service';
import { SignalingService } from '../services/signaling/signaling.service';

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

  constructor(private signalingService:SignalingService) { }

  ngOnInit(): void {
  }

  onJoinMeeting() {
    this.signalingService.joinMeeting(this.meetingId, this.password);
  }

}

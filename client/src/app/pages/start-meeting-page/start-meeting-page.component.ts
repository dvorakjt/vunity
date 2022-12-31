import { Component } from '@angular/core';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { MeetingStatus } from 'src/app/constants/meeting-status';

@Component({
  selector: 'app-start-meeting-page',
  templateUrl: './start-meeting-page.component.html',
  styleUrls: ['./start-meeting-page.component.scss']
})
export class StartMeetingPageComponent {
  meetingStatuses = MeetingStatus;

  constructor(public activeMeetingService:ActiveMeetingService) {}
}

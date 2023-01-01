import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { MeetingStatus } from 'src/app/constants/meeting-status';

@Component({
  selector: 'app-join-meeting-page',
  templateUrl: './join-meeting-page.component.html',
  styleUrls: ['./join-meeting-page.component.scss']
})
export class JoinMeetingPageComponent {
  meetingStatuses = MeetingStatus;
  meetingId;

  constructor(
    public activeMeetingService:ActiveMeetingService,
    private activatedRoute:ActivatedRoute
  ) {
    this.meetingId = this.activatedRoute.snapshot.queryParamMap.get('id') ? this.activatedRoute.snapshot.queryParamMap.get('id') as string : '';
  }
}

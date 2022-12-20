import { Component, OnInit } from '@angular/core';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { Meeting } from 'src/app/models/meeting.model';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { MeetingStatus } from 'src/app/constants/meeting-status';

@Component({
  selector: 'app-meetings-list',
  templateUrl: './meetings-list.component.html',
  styleUrls: ['./meetings-list.component.scss']
})
export class MeetingsListComponent implements OnInit {
  showModal = false;

  constructor(public meetingsService:MeetingsService, private activeMeetingService:ActiveMeetingService) { }

  ngOnInit(): void {
  }

  onOpen(meeting:Meeting) {
    this.activeMeetingService.meetingStatusChanged.subscribe({
      next: (value:any) => {
        if(value === MeetingStatus.AwaitingMedia) this.showModal = true;
      }
    })
    this.activeMeetingService.authenticateAsHost(meeting.id);
  }

}

import { Component, OnInit } from '@angular/core';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { Meeting } from 'src/app/models/meeting.model';

@Component({
  selector: 'app-meetings-list',
  templateUrl: './meetings-list.component.html',
  styleUrls: ['./meetings-list.component.scss']
})
export class MeetingsListComponent implements OnInit {
  meetings:Meeting[] = [];

  constructor(private meetingsService:MeetingsService) { }

  ngOnInit(): void {
    this.meetings = this.meetingsService.getMeetings();
    this.meetingsService.meetingsModified.subscribe((modifiedMeetings:Meeting[]) => {
      this.meetings = modifiedMeetings;
    });
  }

}

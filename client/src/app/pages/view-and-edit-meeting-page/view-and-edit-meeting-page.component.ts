import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meeting } from 'src/app/models/meeting.model';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';

@Component({
  selector: 'app-view-and-edit-meeting-page',
  templateUrl: './view-and-edit-meeting-page.component.html',
  styleUrls: ['./view-and-edit-meeting-page.component.scss']
})
export class ViewAndEditMeetingPageComponent implements OnInit {
  meetingId:any;
  meeting?:Meeting;

  constructor(private meetingsService:MeetingsService, private route:ActivatedRoute) {
    this.meetingId = this.route.snapshot.queryParamMap.get('id');
  }

  ngOnInit(): void {
    if(this.meetingId) {
      console.log(this.meetingId);
      this.meetingsService.getMeetingById(this.meetingId).then((meeting) => {
        this.meeting = meeting as Meeting;
        console.log(this.meeting);
      }).catch((e) => {
        console.log(e);
      });
    }
  }
}

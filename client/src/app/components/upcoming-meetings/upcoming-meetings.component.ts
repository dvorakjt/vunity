import { Component, EventEmitter, Output } from '@angular/core';
import { Meeting } from 'src/app/models/meeting.model';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';

@Component({
  selector: 'app-upcoming-meetings',
  templateUrl: './upcoming-meetings.component.html',
  styleUrls: ['./upcoming-meetings.component.scss']
})
export class UpcomingMeetingsComponent {
  
  @Output() meetingSelected = new EventEmitter<Meeting>();

  constructor(public meetingsService:MeetingsService, public dateTimeService:DateTimeService) {}

  onMeetingSelected(meeting:Meeting) {
    this.meetingSelected.emit(meeting);
  }
}

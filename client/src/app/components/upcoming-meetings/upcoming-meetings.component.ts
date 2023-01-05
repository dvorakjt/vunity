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
  
  @Output() newMeetingButtonClicked = new EventEmitter<void>();
  @Output() meetingSelected = new EventEmitter<Meeting>();

  constructor(public meetingsService:MeetingsService, public dateTimeService:DateTimeService) {}

  onNewMeeting() {
    this.newMeetingButtonClicked.emit();
  }

  onMeetingSelected(meeting:Meeting) {
    this.meetingSelected.emit(meeting);
  }
}

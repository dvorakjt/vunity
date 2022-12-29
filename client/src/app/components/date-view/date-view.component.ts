import { Component, EventEmitter, Input, Output } from '@angular/core';
import { faAngleLeft, faP } from '@fortawesome/free-solid-svg-icons';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Meeting } from 'src/app/models/meeting.model';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { ViewDateService } from 'src/app/services/view-date/view-date.service';

@Component({
  selector: 'app-date-view',
  templateUrl: './date-view.component.html',
  styleUrls: ['./date-view.component.scss']
})
export class DateViewComponent {

  @Input() showBackButton = true;

  @Output() backButtonClicked = new EventEmitter<void>();
  @Output() addMeetingButtonClicked = new EventEmitter<string>();
  @Output() meetingSelected = new EventEmitter<Meeting>();

  faAngleLeft = faAngleLeft;
  faPlusCircle = faPlusCircle;

  constructor(public viewDateService:ViewDateService, public dateTimeService:DateTimeService) {}

  onGoBack() {
    this.backButtonClicked.emit();
  }

  onMeetingSelected(meeting:Meeting) {
    this.meetingSelected.emit(meeting);
  }

  onAddMeeting() {
    if(this.viewDateService.selectedDate) {
      const {year, month, date} = this.viewDateService.selectedDate;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      console.log(dateStr);
      this.addMeetingButtonClicked.emit(dateStr);
    }
  }
}

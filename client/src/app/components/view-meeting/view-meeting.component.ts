import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Meeting } from 'src/app/models/meeting.model';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-view-meeting',
  templateUrl: './view-meeting.component.html',
  styleUrls: ['./view-meeting.component.scss']
})
export class ViewMeetingComponent {

  @Input() meeting?:Meeting;
  @Input() showBackButton = true;

  @Output() editModeActivated = new EventEmitter<void>();
  @Output() backButtonClicked = new EventEmitter<void>();

  faAngleLeft = faAngleLeft;

  onGoBack() {
    this.backButtonClicked.emit();
  }

  onEnterEditMode() {
    this.editModeActivated.emit();
  }

  getMeetingDateTime() {
    if(this.meeting) {
      return DateTime.fromISO(this.meeting.startDateTime).toLocaleString(DateTime.DATETIME_FULL);
    } else return '';
  }

}

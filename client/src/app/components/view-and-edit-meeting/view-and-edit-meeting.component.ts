import { Component, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Meeting } from 'src/app/models/meeting.model';

@Component({
  selector: 'app-view-and-edit-meeting',
  templateUrl: './view-and-edit-meeting.component.html',
  styleUrls: ['./view-and-edit-meeting.component.scss']
})
export class ViewAndEditMeetingComponent{

  @Input() meeting?:Meeting;

  isEditing = false;
  @Input() showBackButton = true;
  @Output() backButtonClicked = new EventEmitter<void>();

  onGoBack() {
    this.backButtonClicked.emit();
  }
}

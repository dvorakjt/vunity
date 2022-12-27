import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Meeting } from 'src/app/models/meeting.model';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-view-meeting',
  templateUrl: './view-meeting.component.html',
  styleUrls: ['./view-meeting.component.scss']
})
export class ViewMeetingComponent implements OnChanges{

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

  ngOnChanges(changes: SimpleChanges): void {
    console.log("hello");
  }
}

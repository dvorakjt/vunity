import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Meeting } from 'src/app/models/meeting.model';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';

@Component({
  selector: 'app-edit-meeting',
  templateUrl: './edit-meeting.component.html',
  styleUrls: ['./edit-meeting.component.scss']
})
export class EditMeetingComponent implements OnChanges {
  succeeded = false;
  isLoading = false;
  
  @Input() meeting?:Meeting;

  editMeetingForm = new FormGroup({
    'title': new FormControl(this.meeting ? this.meeting.title : null, [Validators.required]),
    'startDateTime': new FormControl(this.meeting ? this.meeting.startDateTime : null, [Validators.required]),
    'duration': new FormControl(this.meeting ? this.meeting.duration : null, [Validators.required, Validators.pattern(/\d+/), Validators.min(5), Validators.max(120)])
  });

  @Output() viewModeActivated = new EventEmitter<void>();

  constructor(public dateTimeService:DateTimeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if(this.meeting) {
      this.editMeetingForm.setValue({
        title : this.meeting.title,
        startDateTime: this.meeting.startDateTime, //needs to be formatted
        duration: this.meeting.duration
      });
    }
  }

  onSubmit(event:Event) {
    event.preventDefault();
    console.log("submitted");
  }

  onEnterViewMode(event:Event) {
    event.preventDefault();
    this.viewModeActivated.emit();
  }
}

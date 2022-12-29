import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateTime } from 'luxon';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { MeetingUpdateDTO } from 'src/app/models/meeting-update-dto.model';
import { Meeting } from 'src/app/models/meeting.model';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';

@Component({
  selector: 'app-edit-meeting',
  templateUrl: './edit-meeting.component.html',
  styleUrls: ['./edit-meeting.component.scss']
})
export class EditMeetingComponent implements OnChanges {
  editSucceeded = false;
  deleteSucceeded = false;
  isLoading = false;
  serverError = '';
  
  @Input() meeting?:Meeting;

  editMeetingForm = new FormGroup({
    'title': new FormControl(this.meeting ? this.meeting.title : null, [Validators.required]),
    'startDateTime': new FormControl(this.meeting ? this.dateTimeService.convertToFormInputValue(this.meeting.startDateTime) : null, [Validators.required]),
    'duration': new FormControl(this.meeting ? this.meeting.duration : null, [Validators.required, Validators.pattern(/\d+/), Validators.min(5), Validators.max(120)])
  });

  @Output() viewModeActivated = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();


  faAngleLeft = faAngleLeft;

  constructor(public dateTimeService:DateTimeService, private meetingsService:MeetingsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if(this.meeting) {
      this.editMeetingForm.setValue({
        title : this.meeting.title,
        startDateTime: this.dateTimeService.convertToFormInputValue(this.meeting.startDateTime),
        duration: this.meeting.duration
      });
    }
  }

  async onDelete() {
    if(this.meeting) {
      const confirmDelete = window.confirm("Are you sure you would like to permanently delete this meeting?");
      if(confirmDelete) {
        this.isLoading = true;
          try {
            await this.meetingsService.deleteMeeting(this.meeting.id);
            this.deleteSucceeded = true;
            this.isLoading = false;
          } catch(e) {
            this.serverError = 'There was a problem deleting the meeting.';
            this.isLoading = false;
          }
      }
    }
  }

  async onSubmit() {
    if(
      this.editMeetingForm.valid &&
      this.editMeetingForm.value.title && 
      this.editMeetingForm.value.startDateTime &&
      this.editMeetingForm.value.duration &&
      this.meeting
    ) {
      try {
        await this.meetingsService.updateMeeting(
          this.meeting.id, 
          this.editMeetingForm.value.title,
          this.editMeetingForm.value.startDateTime,
          this.editMeetingForm.value.duration
        );
        this.editSucceeded = true;
        this.isLoading = false;
      } catch(e) {
        this.serverError = 'There was a problem updating the meeting.';
        this.isLoading = false;
      }
    }
  }

  onEnterViewMode(event:Event) {
    event.preventDefault();
    this.viewModeActivated.emit();
  }
  
}

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import * as password from 'secure-random-password';
import { MeetingDTO } from 'src/app/models/meeting-dto.model';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-new-meeting',
  templateUrl: './new-meeting.component.html',
  styleUrls: ['./new-meeting.component.scss']
})
export class NewMeetingComponent implements OnInit {

  @Input() date:any;

  succeeded = false;
  isLoading = false;

  newMeetingForm = new FormGroup({
    'title': new FormControl(null, [Validators.required]),
    'startDateTime': new FormControl('', [Validators.required]),
    'duration': new FormControl(null, [Validators.required, Validators.pattern(/\d+/), Validators.min(5), Validators.max(120)]),
    'password': new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(60)])
  });

  guestEmail = '';
  guests:Set<string> = new Set<string>();
  guestEmailError = '';

  serverError = '';

  faRefresh = faRefresh;
  faAdd = faAdd;
  faClose = faClose;

  constructor(private meetingsService:MeetingsService, public dateTimeService:DateTimeService) {
  }

  ngOnInit(): void {
    this.newMeetingForm.setValue({
      title: null,
      startDateTime: this.setDefaultDate(),
      duration: null,
      password: this.getRandomPassword()
    });
  }
  

  setDefaultDate() {
    console.log(this.date);
    if(typeof this.date === 'string' && DateTime.fromISO(this.date).isValid) {
        return this.date + "T12:00";
    } else return '';
  }

  getRandomPassword() {
    return password.randomPassword({
      length: 8,
      characters: [password.lower, password.upper, password.digits, password.symbols] 
    });
  }

  addGuest(event:Event) {
    event.preventDefault();
    if(!this.guestEmail || !this.guestEmail.match(
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    )) {
      this.guestEmailError = 'Please enter a valid email address.';
      return;
    }
    if(!this.guests.has(this.guestEmail)) {
      this.guests.add(this.guestEmail);
      this.guestEmail = '';
    } else this.guestEmailError = 'Guest email already added.';
  }

  removeGuest(event:Event, guest:string) {
    event.preventDefault();
    this.guests.delete(guest);
  }

  onSubmit(event:Event) {

    console.log("button submitted");

    if(this.newMeetingForm.valid && 
      this.newMeetingForm.value.title &&
      this.newMeetingForm.value.duration &&
      this.newMeetingForm.value.password &&
      this.newMeetingForm.value.startDateTime
    ) {
      this.isLoading = true;

      const startDateTimeMillis = this.dateTimeService.getTimeInMillis(this.newMeetingForm.value.startDateTime);

      const meetingDTO = new MeetingDTO(this.newMeetingForm.value.title, startDateTimeMillis, this.newMeetingForm.value.duration, this.newMeetingForm.value.password, Array.from(this.guests));
      
      this.isLoading = true;

      this.meetingsService.apiCall.subscribe({
        next: () => {
          this.isLoading = false;
          this.succeeded = true;
        },
        error: () => {
          this.isLoading = false;
          this.serverError = 'There was a problem creating the meeting.';
        }
      })
      this.meetingsService.createMeeting(meetingDTO);
    } 
  }

  onRefreshPassword(event:Event) {
    event.preventDefault();
    this.newMeetingForm.setValue({
      title: this.newMeetingForm.value.title ? this.newMeetingForm.value.title : null,
      startDateTime: this.newMeetingForm.value.startDateTime ? this.newMeetingForm.value.startDateTime : null,
      duration: this.newMeetingForm.value.duration ? this.newMeetingForm.value.duration : null,
      password: this.getRandomPassword()
    });
  }

  onResetForm(event:Event) {
    event.preventDefault();
    this.newMeetingForm.reset();
    this.succeeded = false;
  }
}

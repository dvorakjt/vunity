import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {MeetingDTO} from '../../models/meeting-dto.model';
import * as password from 'secure-random-password';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { getTimezoneOffsetString } from 'src/app/utils/datetime.util';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-create-meeting',
  templateUrl: './create-meeting.component.html',
  styleUrls: ['./create-meeting.component.scss']
})
export class CreateMeetingComponent implements OnInit {

  newMeetingForm = new FormGroup({
    'title': new FormControl(null, [Validators.required]),
    'startDateTime': new FormControl(null, [Validators.required]),
    'duration': new FormControl(null, [Validators.required, Validators.pattern(/\d+/), Validators.min(5), Validators.max(120)]),
    'password': new FormControl(this.getRandomPassword(), [Validators.required, Validators.minLength(8), Validators.maxLength(60)])
  });
  userTZ? = '';
  userOffsetStr = '';
  guest = '';
  guests:Set<string> = new Set<string>();
  guestError = '';
  creationError = '';
  isLoading = false;
  showModal = new EventEmitter<boolean>();

  constructor(private meetingsService:MeetingsService) {}

  getRandomPassword() {
    return password.randomPassword({
      length: 8,
      characters: [password.lower, password.upper, password.digits, password.symbols] 
    });
  }

  ngOnInit(): void { 
    this.userTZ = new Date()
    .toLocaleDateString('en-US', {
      day: '2-digit',
      timeZoneName: 'short',
    })
    .slice(4);

    this.userOffsetStr = getTimezoneOffsetString();
  }

  addGuest(event:Event) {
    event.preventDefault();
    if(!this.guest || !this.guest.match(
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    )) {
      this.guestError = 'Please enter a valid email address.';
      return;
    }
    if(!this.guests.has(this.guest)) {
      this.guests.add(this.guest);
      this.guest = '';
    } else this.guestError = 'Guest already added.';
  }

  removeGuest(event:Event, guest:string) {
    event.preventDefault();
    this.guests.delete(guest);
  }

  onSubmit() {
    if(this.newMeetingForm.valid && 
      this.newMeetingForm.value.title &&
      this.newMeetingForm.value.duration &&
      this.newMeetingForm.value.password &&
      this.newMeetingForm.value.startDateTime
    ) {
      this.isLoading = true;
      console.log(this.newMeetingForm.value.startDateTime + this.userOffsetStr);
      const startDateTime = DateTime.fromISO(this.newMeetingForm.value.startDateTime);
      console.log(startDateTime);
      const meetingDTO = new MeetingDTO(this.newMeetingForm.value.title, startDateTime.toMillis(), this.newMeetingForm.value.duration, this.newMeetingForm.value.password, Array.from(this.guests));
      this.meetingsService.apiCall.subscribe({
        next: () => {
          this.isLoading = false;
          this.showModal.emit(true);
        },
        error: () => {
          this.isLoading = false;
        }
      })
      this.meetingsService.createMeeting(meetingDTO);
    }
  }

}

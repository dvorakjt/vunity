import { Component } from '@angular/core';
import { Modals } from './modals.enum';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Meeting } from 'src/app/models/meeting.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  modals = Modals;
  modalToShow = this.modals.None;
  selectedMeeting?:Meeting;
  dateToCreateMeetingOn = '';

  faTimes = faTimes;

  onShowNewMeetingModal() {
    this.dateToCreateMeetingOn = '';
    this.modalToShow = this.modals.NewMeeting;
  }

  onViewMeeting(meeting:Meeting) {
    this.selectedMeeting = meeting;
    this.modalToShow = this.modals.ViewAndEditMeeting;
  }

  onViewDate() {
    this.modalToShow = this.modals.ViewDate;
  }

  onCreateMeetingFromCalendar(date:string) {
    this.dateToCreateMeetingOn = date;
    this.modalToShow = this.modals.NewMeeting;
  }

  onCloseModal() {
    this.modalToShow = this.modals.None;
  }
}

import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Meeting } from 'src/app/models/meeting.model';

@Component({
  selector: 'app-view-date-page',
  templateUrl: './view-date-page.component.html',
  styleUrls: ['./view-date-page.component.scss']
})
export class ViewDatePageComponent {
  constructor(public router:Router, public location:Location) {}

  onMeetingSelected(meeting:Meeting) {
    this.router.navigateByUrl(`/meeting?id=${meeting.id}`);
  }

  onGoBack() {
    this.location.back();
  }

  onAddMeeting(dateStr:string) {
    this.router.navigateByUrl(`/newmeeting?date=${dateStr}`);
  }
}

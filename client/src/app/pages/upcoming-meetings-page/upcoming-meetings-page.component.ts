import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Meeting } from 'src/app/models/meeting.model';

@Component({
  selector: 'app-upcoming-meetings-page',
  templateUrl: './upcoming-meetings-page.component.html',
  styleUrls: ['./upcoming-meetings-page.component.scss']
})
export class UpcomingMeetingsPageComponent {

  constructor(public router:Router) {}

  onMeetingSelected(meeting:Meeting) {
    this.router.navigateByUrl(`/meeting?id=${meeting.id}`);
  }
  
  onNewMeeting() {
    this.router.navigateByUrl('/newmeeting');
  }

}


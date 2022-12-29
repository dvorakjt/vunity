import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-new-meeting-page',
  templateUrl: './new-meeting-page.component.html',
  styleUrls: ['./new-meeting-page.component.scss']
})
export class NewMeetingPageComponent {

  date;

  constructor(private route:ActivatedRoute) {
    this.date = this.route.snapshot.queryParamMap.get('date');
    console.log(this.date);
  }
}

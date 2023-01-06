import { Component } from '@angular/core';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';

@Component({
  selector: 'app-awaiting-host',
  templateUrl: './awaiting-host.component.html',
  styleUrls: ['./awaiting-host.component.scss']
})
export class AwaitingHostComponent {
  constructor(private activeMeetingService:ActiveMeetingService) {}
  
  onCancel() {
    this.activeMeetingService.resetMeetingData();
  }

}

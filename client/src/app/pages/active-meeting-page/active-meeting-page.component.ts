import { Component } from '@angular/core';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';

@Component({
  selector: 'app-active-meeting-page',
  templateUrl: './active-meeting-page.component.html',
  styleUrls: ['./active-meeting-page.component.scss']
})
export class ActiveMeetingPageComponent {
  showChat = false;
  showSettingsModal = false;

  constructor(public activeMeetingService:ActiveMeetingService) {}

  onToggleChat(event:boolean) {
    this.showChat = event;
  }

  onChangeMicLevel(event:Event) {
    const target = event.target as HTMLInputElement;
    if(target) {
      this.activeMeetingService.localPeer?.setGain(Number(target.value));
    }
  }
}

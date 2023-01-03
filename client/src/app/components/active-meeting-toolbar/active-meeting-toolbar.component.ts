import { Component, EventEmitter, Input, Output } from '@angular/core';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
import { faDesktop } from '@fortawesome/free-solid-svg-icons';
import { faSignOut } from '@fortawesome/free-solid-svg-icons';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';

@Component({
  selector: 'app-active-meeting-toolbar',
  templateUrl: './active-meeting-toolbar.component.html',
  styleUrls: ['./active-meeting-toolbar.component.scss']
})
export class ActiveMeetingToolbarComponent {
  @Input() isMobile = false;
  
  showChat = false;

  @Output() showChatChanged = new EventEmitter<boolean>();
  @Output() showSettingsButtonClicked = new EventEmitter<void>();

  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;
  faVideo = faVideo;
  faVideoSlash = faVideoSlash;
  faCog = faCog;
  faUsers = faUsers;
  faMessage = faMessage;
  faDesktop = faDesktop;
  faSignOut = faSignOut;

  constructor(public activeMeetingService:ActiveMeetingService) {}

  onToggleMicrophone() {
    this.activeMeetingService.setLocalAudioEnabled(!this.activeMeetingService.localPeer?.audioEnabled);
  }

  onToggleVideo() {
    this.activeMeetingService.setLocalVideoEnabled(!this.activeMeetingService.localPeer?.videoEnabled);
  }

  onLeaveOrClose() {
    let departureConfirmed = window.confirm(`Are you sure you would like to ${this.activeMeetingService.isHost ? 'close' : 'leave'} this meeting?`);
    if(departureConfirmed) {
      if(this.activeMeetingService.isHost) this.activeMeetingService.close();
      else this.activeMeetingService.leave();
    } 
  }

  onToggleChatMenu() {
    this.showChat = !this.showChat;
    this.showChatChanged.emit(this.showChat);
  }

  onOpenSettingsMenu() {
    this.showSettingsButtonClicked.emit();
  }
}

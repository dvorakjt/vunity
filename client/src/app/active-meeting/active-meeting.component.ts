import { Component, ChangeDetectorRef, OnInit, ViewChild, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
import { faDesktop } from '@fortawesome/free-solid-svg-icons';
import { faSignOut } from '@fortawesome/free-solid-svg-icons';
import { VideoSize } from '../shared/video/video-sizes';
import { ActiveMeetingService } from '../services/active-meeting/active-meeting.service';

@Component({
  selector: 'app-active-meeting',
  templateUrl: './active-meeting.component.html',
  styleUrls: ['./active-meeting.component.scss']
})
export class ActiveMeetingComponent implements OnInit, AfterViewInit {
  @ViewChildren('messages') messages?: QueryList<any>;
  @ViewChild('messagesContainer', {static: false}) messagesContainer?:ElementRef;

  newMessage = '';
  chatIsOpen = false;
  showSettingsModal = false;

  sizes = VideoSize;
  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;
  faVideo = faVideo;
  faVideoSlash = faVideoSlash;
  faCog = faCog;
  faMessage = faMessage;
  faDesktop = faDesktop;
  faSignOut = faSignOut;

  currentSpeaker = 'me';

  constructor(public activeMeetingService:ActiveMeetingService, private changeDetector:ChangeDetectorRef) {}

  ngOnInit(): void {
    this.activeMeetingService.newChatMessageReceived.subscribe({
      next: () => {
        this.changeDetector.detectChanges();
        this.scrollToBottomOfMessages();
      }
    });
  }

  ngAfterViewInit() {
    this.scrollToBottomOfMessages();
    if(this.messages) this.messages.changes.subscribe(this.scrollToBottomOfMessages);
  }

  onSendMessage() {
    this.activeMeetingService.broadCastMessage('chat', this.newMessage);
    this.newMessage = '';
  }
  
  scrollToBottomOfMessages = () => {
    try {
      if(this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } 
    } catch (err) {}
  }

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

  onChangeMicLevel(event:Event) {
    const target = event.target as HTMLInputElement;
    if(target) {
      this.activeMeetingService.localPeer?.setGain(Number(target.value));
    }
  }

  replaceLinksWithTags(message:string) {
    return message.replace(/http[s]{0,1}:\/\/\S+/g, (address:string) => {
      return `<a target="_blank" ref="noreferrer" href="${address}" class="chatLink">${address}</a>`
    });
  }
}

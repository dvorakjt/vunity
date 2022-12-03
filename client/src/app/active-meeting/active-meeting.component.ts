import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SignalingService } from '../services/signaling/signaling.service';
import { Message } from '../models/message.model';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
import { faDesktop } from '@fortawesome/free-solid-svg-icons';
import { faSignOut } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-active-meeting',
  templateUrl: './active-meeting.component.html',
  styleUrls: ['./active-meeting.component.scss']
})
export class ActiveMeetingComponent implements OnInit {
  messages: Message[] = [];
  localStream?: MediaStream;
  remoteStreams: MediaStream[] = [];
  newMessage = '';
  chatIsOpen = false;
  videos: null[] = [];
  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;
  faVideo = faVideo;
  faVideoSlash = faVideoSlash;
  faCog = faCog;
  faMessage = faMessage;
  faDesktop = faDesktop;
  faSignOut = faSignOut;

  constructor(public signalingService: SignalingService, private changeDetection: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.messages = this.signalingService.getMessages();
    this.signalingService.receivedNewMessage.subscribe(() => {
      console.log("event fired");
      this.messages = this.signalingService.getMessages();
      this.changeDetection.detectChanges();
    });
    this.remoteStreams = this.signalingService.getStreams();
    this.signalingService.receivedNewStream.subscribe(() => {
      this.remoteStreams = this.signalingService.getStreams();
      this.changeDetection.detectChanges();
    })
    this.localStream = this.signalingService.localStream;
  }

  onSendMessage() {
    this.signalingService.broadCastMessage(this.newMessage);
    this.newMessage = '';
  }

}

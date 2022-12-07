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
import { peerStreamData } from '../models/peer-stream-data';
import { VideoSize } from '../shared/video/video-sizes';

@Component({
  selector: 'app-active-meeting',
  templateUrl: './active-meeting.component.html',
  styleUrls: ['./active-meeting.component.scss']
})
export class ActiveMeetingComponent implements OnInit {
  messages: Message[] = [];
  localStream?: MediaStream;
  peers:peerStreamData[] = [];
  newMessage = '';
  chatIsOpen = false;
  muted = false;
  hideVideo = false;

  sizes = VideoSize;
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
      this.messages = this.signalingService.getMessages();
      this.changeDetection.detectChanges();
    });
    this.peers = this.signalingService.getPeers();
    this.signalingService.receivedNewStream.subscribe(() => {
      this.peers = this.signalingService.getPeers();
      this.changeDetection.detectChanges();
    })
    this.localStream = this.signalingService.localStream;
  }

  onSendMessage() {
    this.signalingService.broadCastMessage('chat', this.newMessage);
    this.newMessage = '';
  }

  onToggleMicrophone() {
    this.muted = !this.muted;
    this.signalingService.toggleMicrophone();
  }

  onToggleVideo() {
    this.hideVideo = !this.hideVideo;
    this.signalingService.toggleVideo();
  }
}

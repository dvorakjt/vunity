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
import * as hark from 'hark';

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
  currentSpeakingPeer?:peerStreamData;
  speechListeners:hark.Harker[] = [];

  constructor(public signalingService: SignalingService, private changeDetection: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.messages = this.signalingService.getMessages();
    this.signalingService.receivedNewMessage.subscribe(() => {
      this.messages = this.signalingService.getMessages();
      this.changeDetection.detectChanges();
    });
    this.peers = this.signalingService.getPeers();
    this.addSpeechListeners();
    this.signalingService.receivedNewStream.subscribe(() => {
      this.peers = this.signalingService.getPeers();
      this.addSpeechListeners();
      this.changeDetection.detectChanges();
    })
    this.localStream = this.signalingService.localStream;

  }

  addSpeechListeners() {
    this.speechListeners = [];
    if(this.localStream) {
      const localListener = hark(this.localStream, {});
      localListener.on('speaking', () => {
        this.currentSpeaker = 'me';
      });
    }
    this.peers.forEach(peer => {
      const peerListener = hark(peer.stream, {});
      peerListener.on('speaking', () => {
        this.currentSpeaker = 'peer';
        this.currentSpeakingPeer = this.signalingService.getPeerStreamData(peer.id);
        this.changeDetection.detectChanges();
      });
      this.speechListeners.push(peerListener);
    });
  }

  onSendMessage() {
    this.signalingService.broadCastMessage('chat', this.newMessage);
    this.newMessage = '';
  }

  onToggleMicrophone() {
    this.signalingService.setMicrophoneEnabled(!this.signalingService.audioEnabled);
    this.changeDetection.detectChanges();
  }

  onToggleVideo() {
    this.signalingService.setVideoEnabled(!this.signalingService.videoEnabled);
    this.changeDetection.detectChanges();
  }
}

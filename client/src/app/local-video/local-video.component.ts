import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { SignalingService } from '../services/signaling/signaling.service';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { VideoSize } from '../shared/video/video-sizes';

@Component({
  selector: 'app-local-video',
  templateUrl: './local-video.component.html',
  styleUrls: ['../shared/video/video-styles.scss']
})
export class LocalVideoComponent implements OnInit{
  @Input() size = VideoSize.Thumbnail;
  sizes = VideoSize;
  audioEnabled:boolean = true;
  videoEnabled:boolean = true;
  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;

  constructor(public signalingService:SignalingService, private changeDetection: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.audioEnabled = this.signalingService.audioEnabled;
    this.videoEnabled = this.signalingService.videoEnabled;
    this.signalingService.localAudioToggled.subscribe({
      next: (status:boolean) => {
        this.audioEnabled = status;
        this.changeDetection.detectChanges();
      } 
    });
    this.signalingService.localVideoToggled.subscribe({
      next: (status:boolean) => {
        this.videoEnabled = status;
        this.changeDetection.detectChanges();
      }
    });
  }
}
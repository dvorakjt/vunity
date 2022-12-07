import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { SignalingService } from '../services/signaling/signaling.service';
import { VideoSize } from '../shared/video/video-sizes';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-remote-video',
  templateUrl: './remote-video.component.html',
  styleUrls: ['../shared/video/video-styles.scss']
})
export class RemoteVideoComponent implements OnInit{
  @Input() size = VideoSize.Thumbnail;
  @Input() username:string = '';
  @Input() stream?:MediaStream;
  @Input() audioEnabled:boolean = false;
  @Input() videoEnabled:boolean = false;
  @Input() sessionId:string = '';
  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;
  sizes = VideoSize;

  constructor(private signalingService:SignalingService, private changeDetection: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.signalingService.remoteAudioToggled.subscribe({
      next: (value:any) => {
        console.log(value);
        console.log(this.sessionId);
        if(value.id === this.sessionId) {
          this.audioEnabled = value.status
          this.changeDetection.detectChanges();
        }
      } 
    });
    this.signalingService.remoteVideoToggled.subscribe({
      next: (value:any) => {
        console.log(value);
        console.log(this.sessionId);
        if(value.id === this.sessionId) {
          this.videoEnabled = value.status;
          this.changeDetection.detectChanges();
        }
      }
    });
  }
}

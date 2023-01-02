import { Component, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { VideoSize } from './video-sizes';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { Peer } from '../../models/peer.model';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {
  @Input() peer?:Peer;
  @Input() size = VideoSize.Thumbnail;
  @Input() muted:boolean = false;

  isSpeaking = false;

  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;
  sizes = VideoSize;

  constructor(private changeDetector:ChangeDetectorRef) {}

  ngOnInit(): void {
    if(this.peer) {
      this.peer.audioToggled.subscribe({
        next: () => {
          this.changeDetector.detectChanges();
        }
      });
      this.peer.videoToggled.subscribe({
        next: () => {
          this.changeDetector.detectChanges();
        }
      });
      this.peer.speechEventEmitter.subscribe({
        next: (isSpeaking) => {
          this.isSpeaking = isSpeaking;
        }
      });
    }
  }
}


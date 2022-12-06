import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { SignalingService } from '../services/signaling/signaling.service';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {
  @Input() username:string = '';
  @Input() stream?:MediaStream;
  @Input() audioEnabled:boolean = false;
  @Input() videoEnabled:boolean = false;
  @Input() sessionId:string = '';
  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;

  constructor(private signalingService:SignalingService, private changeDetection: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.signalingService.audioToggled.subscribe({
      next: (value:any) => {
        console.log(value);
        console.log(this.sessionId);
        if(value.id === this.sessionId) {
          this.audioEnabled = value.status
          this.changeDetection.detectChanges();
        }
      } 
    });
    this.signalingService.videoToggled.subscribe({
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
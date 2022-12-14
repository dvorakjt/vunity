import { Component, Input } from '@angular/core';
import { VideoSize } from '../shared/video/video-sizes';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { Peer } from '../models/peer.model';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent {
  @Input() peer?:Peer;
  @Input() size = VideoSize.Thumbnail;
  @Input() muted:boolean = false;

  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;
  sizes = VideoSize;

}

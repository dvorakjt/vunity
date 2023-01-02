import { Component } from '@angular/core';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { VideoSize } from '../video/video-sizes';

@Component({
  selector: 'app-speaker-view',
  templateUrl: './speaker-view.component.html',
  styleUrls: ['./speaker-view.component.scss']
})
export class SpeakerViewComponent {

  videoSize = VideoSize.Speaker;

  constructor(public activeMeetingService:ActiveMeetingService) {}
}

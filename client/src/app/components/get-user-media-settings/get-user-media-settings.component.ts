import { Component } from '@angular/core';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { VideoSize } from 'src/app/shared/video/video-sizes';

@Component({
  selector: 'app-get-user-media-settings',
  templateUrl: './get-user-media-settings.component.html',
  styleUrls: ['./get-user-media-settings.component.scss']
})
export class GetUserMediaSettingsComponent {
  videoSize = VideoSize.Speaker;

  constructor(public activeMeetingService:ActiveMeetingService) {}

  onCancel() {
    this.activeMeetingService.resetMeetingData();
  }

  onContinue() {
    this.activeMeetingService.confirmMediaSettings();
  }
}

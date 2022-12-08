import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MeetingStatus } from '../services/signaling/meeting-status';
import { SignalingService } from '../services/signaling/signaling.service';
import { VideoSize } from '../shared/video/video-sizes';

@Component({
  selector: 'app-media-settings-modal',
  templateUrl: './media-settings-modal.component.html',
  styleUrls: ['./media-settings-modal.component.scss']
})
export class MediaSettingsModalComponent implements OnInit { 
  @Output() closeModal = new EventEmitter<void>();
  modalStatus = 'awaitingMedia';
  videoSize = VideoSize.Modal;

  constructor(public signalingService:SignalingService) {}

  ngOnInit(): void {
    this.signalingService.meetingStatusChanged.subscribe({
      next: (status:MeetingStatus) => {  
        if(status === MeetingStatus.AwaitingMediaSettings) {
          this.modalStatus = 'mediaSettings';
        } 
        else if(status === MeetingStatus.ReadyToJoin) {
          this.modalStatus = 'connectingToSignalingServer';
        }
        else if(status === MeetingStatus.WaitingForHost) {
          this.modalStatus = 'waitingForHost';
        }
        else if(status === MeetingStatus.InMeeting) {
          this.closeModal.emit();
        }
      }
    })
    this.signalingService.getMedia();
  }

  onCancel() {
    this.signalingService.resetMeetingData();
    this.closeModal.emit();
  }

  onContinue() {
    this.signalingService.confirmMediaSettings();
  }
}

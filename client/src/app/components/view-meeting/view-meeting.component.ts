import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Meeting } from 'src/app/models/meeting.model';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { DateTime } from 'luxon';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { MeetingStatus } from 'src/app/constants/meeting-status';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-meeting',
  templateUrl: './view-meeting.component.html',
  styleUrls: ['./view-meeting.component.scss']
})
export class ViewMeetingComponent {

  @Input() meeting?:Meeting;
  @Input() showBackButton = true;

  @Output() editModeActivated = new EventEmitter<void>();
  @Output() backButtonClicked = new EventEmitter<void>();

  faAngleLeft = faAngleLeft;

  constructor(
    private activeMeetingService:ActiveMeetingService,
    private loadingService:LoadingService,
    private router:Router
  ) {}

  onGoBack() {
    this.backButtonClicked.emit();
  }

  onEnterEditMode() {
    this.editModeActivated.emit();
  }

  getMeetingDateTime() {
    if(this.meeting) {
      return DateTime.fromISO(this.meeting.startDateTime).toLocaleString(DateTime.DATETIME_FULL);
    } else return '';
  }

  onStart() {
    if(this.meeting) {
      this.activeMeetingService.meetingStatusChanged.subscribe({
        next: (status:MeetingStatus) => {
          if(status === MeetingStatus.AwaitingMedia) {
            this.loadingService.isLoading = false;
            //navigate to starting meeting page
            console.log('should navigate');
            this.router.navigateByUrl('/startmeeting');
          }
        }
      });
      this.activeMeetingService.errorEmitter.subscribe({
        next: (e:Error) => {
          if(e.name === 'HostAuthError') {
            this.loadingService.isLoading = false;
            window.alert(e.message);
          }
        }
      });
      this.loadingService.isLoading = true;
      this.activeMeetingService.authenticateAsHost(this.meeting.id);
    }
  }
}

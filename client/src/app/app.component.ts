import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { MeetingsService } from './services/meetings/meetings.service';
import { MeetingStatus } from './constants/meeting-status';
import { ActiveMeetingService } from './services/active-meeting/active-meeting.service';
import { LoadingService } from './services/loading/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Vunity';
  isLoading = true;
  meetingStatuses = MeetingStatus;
  joinMeetingModalOpen = false;
  showActiveMeeting = false;

  @HostListener('window:beforeunload', ['$event']) 
  private confirmNavigateAwayIfInMeeting($event:any) {
    if(this.activeMeetingService.meetingStatus != this.meetingStatuses.NotInMeeting) {
      return confirm();
    } else return true;
  }

  constructor(
    public authService:AuthService, 
    public meetingsService:MeetingsService, 
    public activeMeetingService:ActiveMeetingService,
    public loadingService:LoadingService
  ) {
  }
  
  ngOnInit(): void {
    this.activeMeetingService.meetingStatusChanged.subscribe({
      next: (status:MeetingStatus) => {
        if(status === MeetingStatus.InMeeting) {
          this.showActiveMeeting = true;
        } else this.showActiveMeeting = false;
      }
    })
  }

}

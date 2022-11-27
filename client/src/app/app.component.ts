import { Component, HostListener } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { AuthInterceptor } from './services/auth/auth-interceptor.service';
import { MeetingsService } from './services/meetings/meetings.service';
import { SignalingService } from './services/signaling/signaling.service';
import { MeetingStatus } from './services/signaling/meeting-status';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [AuthInterceptor, MeetingsService, SignalingService]
})
export class AppComponent {
  title = 'client';
  isLoading = true;
  meetingStatuses = MeetingStatus;

  // @HostListener('window:beforeunload', ['$event']) 
  // private confirmNavigateAwayIfInMeeting($event:any) {
  //   if(this.signalingService.meetingStatus == this.meetingStatuses.InMeeting) {
  //     return confirm();
  //   } else return true;
  // }

  constructor(public authService:AuthService, public authInterceptor:AuthInterceptor, public meetingsService:MeetingsService, public signalingService:SignalingService) {}

}

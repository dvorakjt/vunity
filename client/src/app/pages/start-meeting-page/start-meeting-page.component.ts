import { Component, OnInit } from '@angular/core';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { MeetingStatus } from 'src/app/constants/meeting-status';
import { Router } from '@angular/router';
import { isMobile } from 'src/app/utils/deviceDetection';

@Component({
  selector: 'app-start-meeting-page',
  templateUrl: './start-meeting-page.component.html',
  styleUrls: ['./start-meeting-page.component.scss']
})
export class StartMeetingPageComponent implements OnInit{
  meetingStatuses = MeetingStatus;

  constructor(public activeMeetingService:ActiveMeetingService, private router:Router) {}

  ngOnInit(): void {
    this.activeMeetingService.meetingStatusChanged.subscribe({
      next: (status:MeetingStatus) => {
        if(status === MeetingStatus.NotInMeeting) {
          if(window.innerWidth > 540 && !isMobile()) this.router.navigateByUrl('/dashboard');
          else this.router.navigateByUrl('/upcomingmeetings');
        }
      }
    });
  }
}

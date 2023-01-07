import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { MeetingStatus } from 'src/app/constants/meeting-status';
import { showRecaptcha, hideRecaptcha } from 'src/app/utils/recaptcha.util';

@Component({
  selector: 'app-join-meeting-page',
  templateUrl: './join-meeting-page.component.html',
  styleUrls: ['./join-meeting-page.component.scss']
})
export class JoinMeetingPageComponent implements AfterViewInit, OnDestroy{
  meetingStatuses = MeetingStatus;
  meetingId;

  constructor(
    public activeMeetingService:ActiveMeetingService,
    private activatedRoute:ActivatedRoute
  ) {
    this.meetingId = this.activatedRoute.snapshot.queryParamMap.get('id') ? this.activatedRoute.snapshot.queryParamMap.get('id') as string : '';
    this.activeMeetingService.meetingStatusChanged.subscribe((status) => {
      if(status === MeetingStatus.NotInMeeting) {
        showRecaptcha();
      } else hideRecaptcha();
    });
  }
 
  ngAfterViewInit(): void {
    showRecaptcha();
  }

  ngOnDestroy(): void {
    hideRecaptcha();
  }
}

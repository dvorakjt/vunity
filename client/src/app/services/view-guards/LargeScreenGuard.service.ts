import { Injectable } from '@angular/core';
import { CanActivate,CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { MeetingStatus } from 'src/app/constants/meeting-status';
import { ActiveMeetingService } from '../active-meeting/active-meeting.service';

@Injectable()
export class LargeScreenGuard implements CanActivate,CanActivateChild {
  constructor(private router: Router, private activeMeetingService:ActiveMeetingService) {
    window.addEventListener('resize', () => {
        if(window.innerWidth <= 540 && activeMeetingService.meetingStatus == MeetingStatus.NotInMeeting) {
            this.router.navigate(["/upcomingmeetings"]);
        }
    });
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if(window.innerWidth > 540) {
        return true;
    }
    this.router.navigate(["/upcomingmeetings"]);
    return false;
  }

   canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if(window.innerWidth > 540) {
        return true;
    }
    this.router.navigate(["/upcomingmeetings"]);
    return false;
  }
}
import { Injectable } from '@angular/core';
import { CanActivate,CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { MeetingStatus } from 'src/app/constants/meeting-status';
import { isMobile } from 'src/app/utils/deviceDetection';
import { ActiveMeetingService } from '../active-meeting/active-meeting.service';

@Injectable()
export class SmallScreenGuard implements CanActivate,CanActivateChild {
  constructor(private router: Router, private activeMeetingService:ActiveMeetingService) {
    window.addEventListener('resize', () => {
        if(window.innerWidth > 540 && !isMobile() && activeMeetingService.meetingStatus == MeetingStatus.NotInMeeting) {
            this.router.navigate(["/dashboard"]);
        }
    });
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if(window.innerWidth <= 540 || isMobile()) {
        return true;
    }
    this.router.navigate(["/dashboard"]);
    return false;
  }

   canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if(window.innerWidth <= 540 || isMobile()) {
        return true;
    }
    this.router.navigate(["/dashboard"]);
    return false;
  }
}
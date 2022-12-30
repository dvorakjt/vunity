import { Injectable } from '@angular/core';
import { CanActivate,CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable()
export class LargeScreenGuard implements CanActivate,CanActivateChild {
  constructor(private router: Router) {
    window.addEventListener('resize', () => {
        if(window.innerWidth <= 540) {
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
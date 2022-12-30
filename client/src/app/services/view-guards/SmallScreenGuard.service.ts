import { Injectable } from '@angular/core';
import { CanActivate,CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable()
export class SmallScreenGuard implements CanActivate,CanActivateChild {
  constructor(private router: Router) {
    window.addEventListener('resize', () => {
        if(window.innerWidth > 540) {
            this.router.navigate(["/dashboard"]);
        }
    });
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if(window.innerWidth <= 540) {
        return true;
    }
    this.router.navigate(["/dashboard"]);
    return false;
  }

   canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if(window.innerWidth <= 540) {
        return true;
    }
    this.router.navigate(["/dashboard"]);
    return false;
  }
}
import { Injectable } from '@angular/core';
import { CanActivate,CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

//these need work because activeUser probably needs to be an observable!

@Injectable()
export class NoAuthGuard implements CanActivate,CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if(!this.authService.activeUser){
      return true;
    }
    this.router.navigate(["/dashboard"]);
    return false;
  }

   canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if(!this.authService.activeUser){
      return true;
    }
    this.router.navigate(["/dashboard"]);
    return false;
  }
}
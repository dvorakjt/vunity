import { Injectable } from '@angular/core';
import { CanActivate,CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router, TitleStrategy } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

//these need work because activeUser probably needs to be an observable!

@Injectable()
export class NoAuthGuard implements CanActivate,CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.isAuthenticated.pipe(map(authStatus => {
      if(authStatus) this.router.navigate(['dashboard']);
      return !authStatus;
    }));
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
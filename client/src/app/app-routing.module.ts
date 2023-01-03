import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './services/auth/auth-guard.service';
import { NoAuthGuard } from './services/auth/no-auth-guard.service';
import { UpcomingMeetingsPageComponent } from './pages/upcoming-meetings-page/upcoming-meetings-page.component';
import { ViewAndEditMeetingPageComponent } from './pages/view-and-edit-meeting-page/view-and-edit-meeting-page.component';
import { NewMeetingPageComponent } from './pages/new-meeting-page/new-meeting-page.component';
import { CalendarPageComponent } from './pages/calendar-page/calendar-page.component';
import { ViewDatePageComponent } from './pages/view-date-page/view-date-page.component';
import { LargeScreenGuard } from './services/view-guards/LargeScreenGuard.service';
import { SmallScreenGuard } from './services/view-guards/SmallScreenGuard.service';
import { JoinMeetingPageComponent } from './pages/join-meeting-page/join-meeting-page.component';
import { StartMeetingPageComponent } from './pages/start-meeting-page/start-meeting-page.component';

const routes: Routes = [
  {
    path: "",
    component: HomeComponent
  },
  {
    path: "login",
    component: LoginComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: "forgotpassword",
    component: ForgotPasswordComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: "resetpassword/:passwordResetURI",
    component: ResetPasswordComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuard, LargeScreenGuard]
  },
  {
    path: "upcomingmeetings",
    component: UpcomingMeetingsPageComponent,
    canActivate: [AuthGuard, SmallScreenGuard]
  },
  {
    path: "calendar",
    component: CalendarPageComponent,
    canActivate: [AuthGuard, SmallScreenGuard]
  },
  {
    path: "viewdate",
    component: ViewDatePageComponent,
    canActivate: [AuthGuard, SmallScreenGuard]
  },
  {
    path: 'newmeeting',
    component: NewMeetingPageComponent,
    canActivate: [AuthGuard, SmallScreenGuard]
  },
  {
    path: "meeting",
    component: ViewAndEditMeetingPageComponent,
    canActivate: [AuthGuard, SmallScreenGuard]
  },
  {
    path: "joinmeeting",
    component: JoinMeetingPageComponent,
  },
  {
    path: 'startmeeting',
    component: StartMeetingPageComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, NoAuthGuard, LargeScreenGuard, SmallScreenGuard]
})
export class AppRoutingModule { }

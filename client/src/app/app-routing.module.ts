import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { JoinMeetingComponent } from './join-meeting/join-meeting.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './services/auth/auth-guard.service';
import { NoAuthGuard } from './services/auth/no-auth-guard.service';

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
    path: "forgot-password",
    component: ForgotPasswordComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: "reset-password",
    component: ResetPasswordComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, NoAuthGuard]
})
export class AppRoutingModule { }

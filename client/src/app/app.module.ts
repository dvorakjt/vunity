import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { JoinMeetingComponent } from './components/join-meeting/join-meeting.component';
import { LoadingWheelComponent } from './shared/loading-wheel/loading-wheel.component';
import { LoadingWheelOverlayComponent } from './shared/loading-wheel-overlay/loading-wheel-overlay.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ModalComponent } from './shared/modal/modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { VideoComponent } from './components/video/video.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { UpcomingMeetingsComponent } from './components/upcoming-meetings/upcoming-meetings.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from "ng-recaptcha";
import { environment } from '../environments/environment';
import { ViewAndEditMeetingComponent } from './components/view-and-edit-meeting/view-and-edit-meeting.component';
import { PeerThumbnailsComponent } from './components/peer-thumbnails/peer-thumbnails.component';
import { ChatMessagesComponent } from './components/chat-messages/chat-messages.component';
import { SpeakerViewComponent } from './components/speaker-view/speaker-view.component';
import { ActiveMeetingToolbarComponent } from './components/active-meeting-toolbar/active-meeting-toolbar.component';
import { NewMeetingComponent } from './components/new-meeting/new-meeting.component';
import { NewMeetingPageComponent } from './pages/new-meeting-page/new-meeting-page.component';
import { ViewAndEditMeetingPageComponent } from './pages/view-and-edit-meeting-page/view-and-edit-meeting-page.component';
import { CalendarPageComponent } from './pages/calendar-page/calendar-page.component';
import { ViewMeetingComponent } from './components/view-meeting/view-meeting.component';
import { EditMeetingComponent } from './components/edit-meeting/edit-meeting.component';
import { UpcomingMeetingsPageComponent } from './pages/upcoming-meetings-page/upcoming-meetings-page.component';
import { CalendarDateComponent } from './components/calendar/calendar-date/calendar-date.component';
import { DateViewComponent } from './components/date-view/date-view.component';
import { ViewDatePageComponent } from './pages/view-date-page/view-date-page.component';
import { GetUsernameComponent } from './components/get-username/get-username.component';
import { AwaitingHostComponent } from './components/awaiting-host/awaiting-host.component';
import { JoinMeetingPageComponent } from './pages/join-meeting-page/join-meeting-page.component';
import { StartMeetingPageComponent } from './pages/start-meeting-page/start-meeting-page.component';
import { AwaitingUserMediaComponent } from './components/awaiting-user-media/awaiting-user-media.component';
import { GetUserMediaSettingsComponent } from './components/get-user-media-settings/get-user-media-settings.component';
import { ActiveMeetingPageComponent } from './pages/active-meeting-page/active-meeting-page.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    JoinMeetingComponent,
    LoadingWheelComponent,
    LoadingWheelOverlayComponent,
    DashboardComponent,
    ModalComponent,
    VideoComponent,
    CalendarComponent,
    UpcomingMeetingsComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    NavbarComponent,
    ViewAndEditMeetingComponent,
    PeerThumbnailsComponent,
    ChatMessagesComponent,
    SpeakerViewComponent,
    ActiveMeetingToolbarComponent,
    NewMeetingComponent,
    NewMeetingPageComponent,
    ViewAndEditMeetingPageComponent,
    CalendarPageComponent,
    ViewMeetingComponent,
    EditMeetingComponent,
    UpcomingMeetingsPageComponent,
    CalendarDateComponent,
    DateViewComponent,
    ViewDatePageComponent,
    GetUsernameComponent,
    AwaitingHostComponent,
    JoinMeetingPageComponent,
    StartMeetingPageComponent,
    AwaitingUserMediaComponent,
    GetUserMediaSettingsComponent,
    ActiveMeetingPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FontAwesomeModule,
    RecaptchaV3Module
  ],
  providers: [{ provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptcha.siteKey }],
  bootstrap: [AppComponent]
})
export class AppModule { }

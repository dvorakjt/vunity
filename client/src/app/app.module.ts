import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { JoinMeetingComponent } from './join-meeting/join-meeting.component';
import { LoadingWheelComponent } from './shared/loading-wheel/loading-wheel.component';
import { LoadingWheelOverlayComponent } from './shared/loading-wheel-overlay/loading-wheel-overlay.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateMeetingComponent } from './dashboard/create-meeting/create-meeting.component';
import { MeetingsListComponent } from './dashboard/meetings-list/meetings-list.component';
import { MeetingDetailComponent } from './dashboard/meeting-detail/meeting-detail.component';
import { ModalComponent } from './shared/modal/modal.component';
import { ActiveMeetingComponent } from './active-meeting/active-meeting.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MediaSettingsModalComponent } from './media-settings-modal/media-settings-modal.component';
import { LocalVideoComponent } from './local-video/local-video.component';
import { RemoteVideoComponent } from './remote-video/remote-video.component';
import { VideoComponent } from './video/video.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    JoinMeetingComponent,
    LoadingWheelComponent,
    LoadingWheelOverlayComponent,
    DashboardComponent,
    CreateMeetingComponent,
    MeetingsListComponent,
    MeetingDetailComponent,
    ModalComponent,
    ActiveMeetingComponent,
    MediaSettingsModalComponent,
    LocalVideoComponent,
    RemoteVideoComponent,
    VideoComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

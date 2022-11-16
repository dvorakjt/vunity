import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { JoinMeetingComponent } from './join-meeting/join-meeting.component';
import { LoadingWheelComponent } from './shared/loading-wheel/loading-wheel.component';
import { LoadingWheelOverlayComponent } from './shared/loading-wheel-overlay/loading-wheel-overlay.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    JoinMeetingComponent,
    LoadingWheelComponent,
    LoadingWheelOverlayComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

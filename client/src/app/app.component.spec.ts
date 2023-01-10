import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { ActiveMeetingService } from './services/active-meeting/active-meeting.service';
import { AuthService } from './services/auth/auth.service';
import { MeetingsService } from './services/meetings/meetings.service';
import { ActiveMeetingServiceStub } from './tests/mocks/ActiveMeetingServiceStub';
import { AuthServiceStub } from './tests/mocks/AuthServiceStub';
import { HttpClientStub } from './tests/mocks/HttpClientStub';
import { MeetingsServiceStub } from './tests/mocks/MeetingsServiceStub';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      providers: [
        {provide: HttpClient, useClass:HttpClientStub},
        {provide: AuthService, useClass: AuthServiceStub},
        {provide: MeetingsService, useClass: MeetingsServiceStub},
        {provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub}
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Vunity'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Vunity');
  });

});

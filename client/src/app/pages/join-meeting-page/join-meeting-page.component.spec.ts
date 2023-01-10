import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { JoinMeetingComponent } from 'src/app/components/join-meeting/join-meeting.component';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { ActivatedRouteStub } from 'src/app/tests/mocks/ActivatedRouteStub';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';
import { RecaptchaV3ServiceStub } from 'src/app/tests/mocks/RecaptchaV3ServiceStub';

import { JoinMeetingPageComponent } from './join-meeting-page.component';

describe('JoinMeetingPageComponent', () => {
  let component: JoinMeetingPageComponent;
  let fixture: ComponentFixture<JoinMeetingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub},
        {provide: ActivatedRoute, useClass: ActivatedRouteStub},
        {provide: ReCaptchaV3Service, useClass: RecaptchaV3ServiceStub}
      ],
      imports: [FormsModule],
      declarations: [ JoinMeetingPageComponent, JoinMeetingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinMeetingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

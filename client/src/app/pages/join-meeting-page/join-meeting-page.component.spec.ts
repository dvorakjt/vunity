import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { ActivatedRouteStub } from 'src/app/tests/mocks/ActivatedRouteStub';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';

import { JoinMeetingPageComponent } from './join-meeting-page.component';

describe('JoinMeetingPageComponent', () => {
  let component: JoinMeetingPageComponent;
  let fixture: ComponentFixture<JoinMeetingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub},
        {provide: ActivatedRoute, useClass: ActivatedRouteStub}
      ],
      declarations: [ JoinMeetingPageComponent ]
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

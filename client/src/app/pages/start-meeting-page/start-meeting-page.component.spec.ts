import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';

import { StartMeetingPageComponent } from './start-meeting-page.component';

describe('StartMeetingPageComponent', () => {
  let component: StartMeetingPageComponent;
  let fixture: ComponentFixture<StartMeetingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub}
      ],
      declarations: [ StartMeetingPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartMeetingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

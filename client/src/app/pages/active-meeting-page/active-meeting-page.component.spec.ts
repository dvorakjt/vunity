import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';

import { ActiveMeetingPageComponent } from './active-meeting-page.component';

describe('ActiveMeetingPageComponent', () => {
  let component: ActiveMeetingPageComponent;
  let fixture: ComponentFixture<ActiveMeetingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub}],
      declarations: [ ActiveMeetingPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveMeetingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

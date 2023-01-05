import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';

import { SpeakerViewComponent } from './speaker-view.component';

describe('SpeakerViewComponent', () => {
  let component: SpeakerViewComponent;
  let fixture: ComponentFixture<SpeakerViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpeakerViewComponent ],
      providers: [{provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeakerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

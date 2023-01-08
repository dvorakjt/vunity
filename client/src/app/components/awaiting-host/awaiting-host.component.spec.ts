import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';

import { AwaitingHostComponent } from './awaiting-host.component';

describe('AwaitingHostComponent', () => {
  let component: AwaitingHostComponent;
  let fixture: ComponentFixture<AwaitingHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub}],
      declarations: [ AwaitingHostComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AwaitingHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

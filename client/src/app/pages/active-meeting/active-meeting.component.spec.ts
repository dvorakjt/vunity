import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveMeetingComponent } from './active-meeting.component';

describe('ActiveMeetingComponent', () => {
  let component: ActiveMeetingComponent;
  let fixture: ComponentFixture<ActiveMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveMeetingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

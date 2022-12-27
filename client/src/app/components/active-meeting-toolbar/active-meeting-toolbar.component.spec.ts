import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveMeetingToolbarComponent } from './active-meeting-toolbar.component';

describe('ActiveMeetingToolbarComponent', () => {
  let component: ActiveMeetingToolbarComponent;
  let fixture: ComponentFixture<ActiveMeetingToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveMeetingToolbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveMeetingToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

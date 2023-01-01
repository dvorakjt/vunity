import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveMeetingPageComponent } from './active-meeting-page.component';

describe('ActiveMeetingPageComponent', () => {
  let component: ActiveMeetingPageComponent;
  let fixture: ComponentFixture<ActiveMeetingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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

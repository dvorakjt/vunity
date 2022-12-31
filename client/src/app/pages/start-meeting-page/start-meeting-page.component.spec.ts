import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartMeetingPageComponent } from './start-meeting-page.component';

describe('StartMeetingPageComponent', () => {
  let component: StartMeetingPageComponent;
  let fixture: ComponentFixture<StartMeetingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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

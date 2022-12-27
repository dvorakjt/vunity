import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingMeetingsComponent } from './upcoming-meetings.component';

describe('UpcomingMeetingsComponent', () => {
  let component: UpcomingMeetingsComponent;
  let fixture: ComponentFixture<UpcomingMeetingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpcomingMeetingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpcomingMeetingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from 'src/app/components/calendar/calendar.component';
import { UpcomingMeetingsComponent } from 'src/app/components/upcoming-meetings/upcoming-meetings.component';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardComponent, UpcomingMeetingsComponent, CalendarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CalendarDateComponent } from 'src/app/components/calendar/calendar-date/calendar-date.component';
import { CalendarComponent } from 'src/app/components/calendar/calendar.component';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { ViewDateService } from 'src/app/services/view-date/view-date.service';
import { MeetingsServiceStub } from 'src/app/tests/mocks/MeetingsServiceStub';
import { ViewDateServiceStub } from 'src/app/tests/mocks/ViewMeetingServiceStub';

import { CalendarPageComponent } from './calendar-page.component';

describe('CalendarPageComponent', () => {
  let component: CalendarPageComponent;
  let fixture: ComponentFixture<CalendarPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FontAwesomeModule],
      providers: [
        {provide: MeetingsService, useClass:MeetingsServiceStub},
        {provide: ViewDateService, useClass: ViewDateServiceStub}
      ],
      declarations: [ CalendarPageComponent, CalendarComponent, CalendarDateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call router.navigate when onDateSelected is called.', () => {
    spyOn(component.router, 'navigate'); 
    component.onDateSelected();
    expect(component.router.navigate).toHaveBeenCalledWith(['/viewdate']);
  });

});

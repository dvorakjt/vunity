import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateTime } from 'luxon';
import { Meeting } from 'src/app/models/meeting.model';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { ViewDateService } from 'src/app/services/view-date/view-date.service';
import { ViewDateServiceStub } from 'src/app/tests/mocks/ViewMeetingServiceStub';
import { DateTimeServiceStub } from 'src/app/tests/mocks/DateTimeServiceStub';
import { SelectedDate } from 'src/app/types/selected-date.type';

import { DateViewComponent } from './date-view.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

describe('DateViewComponent', () => {
  let component: DateViewComponent;
  let fixture: ComponentFixture<DateViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateViewComponent ],
      imports: [FontAwesomeModule],
      providers: [
        {provide: ViewDateService, useClass: ViewDateServiceStub},
        {provide: DateTimeService, useClass: DateTimeServiceStub},]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a back button when showBackButton defaults to true.', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('should not create a back button when showBackButton is set to false', () => {
    component.showBackButton = false;
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(1);
  });

  it('should emit an event when onGoBack is called.', () => {
    spyOn(component.backButtonClicked, 'emit');
    component.onGoBack();
    expect(component.backButtonClicked.emit).toHaveBeenCalled();
  });

  it('should call onGoBack when the back button is clicked.', () => {
    spyOn(component, 'onGoBack');
    fixture.nativeElement.querySelector('button').click();
    expect(component.onGoBack).toHaveBeenCalled();
  });

  it('should not render the meetingList if there is no selected date.', () => {
    const meetingList = fixture.nativeElement.getElementsByClassName('meetingList');
    expect(meetingList.length).toBe(0);
  });

  it('should render the meetingList if there is a selected date.', () => {
    const meeting = new Meeting("1", "Test Meeting", "password", 60, DateTime.fromObject({year: 1930, month: 10, day: 19}).toISO(), [], "1");
    const selectedDate:SelectedDate = {
      year: 1930,
      month: 10,
      date: 19,
      meetings: [meeting]
    }
    component.viewDateService.selectedDate = selectedDate;
    fixture.detectChanges();
    const meetingList = fixture.nativeElement.getElementsByClassName('meetingList');
    expect(meetingList.length).toBe(1);
  });

  it('should emit a Meeting event when onMeetingSelected is called', () => {
    spyOn(component.meetingSelected, 'emit');
    const meeting = new Meeting("1", "Test Meeting", "password", 60, DateTime.fromObject({year: 1930, month: 10, day: 19}).toISO(), [], "1");
    component.onMeetingSelected(meeting); 
    expect(component.meetingSelected.emit).toHaveBeenCalledWith(meeting);
  });

  it('should call onMeetingSelected when the details button of a meeting is called.', () => {
    spyOn(component, 'onMeetingSelected');
    const meeting = new Meeting("1", "Test Meeting", "password", 60, DateTime.fromObject({year: 1930, month: 10, day: 19}).toISO(), [], "1");
    const selectedDate:SelectedDate = {
      year: 1930,
      month: 10,
      date: 19,
      meetings: [meeting]
    }
    component.viewDateService.selectedDate = selectedDate;
    fixture.detectChanges();
    fixture.nativeElement.getElementsByClassName('btnPrimary')[0].click();
    expect(component.onMeetingSelected).toHaveBeenCalledWith(meeting);
  });

  it('should emit an addMeetingButtonClicked event when onAddMeeting is called and there is a selected date.', () => {
    spyOn(component.addMeetingButtonClicked, 'emit');
    const meeting = new Meeting("1", "Test Meeting", "password", 60, DateTime.fromObject({year: 1930, month: 10, day: 19}).toISO(), [], "1");
    const selectedDate:SelectedDate = {
      year: 1930,
      month: 10,
      date: 19,
      meetings: [meeting]
    }
    component.viewDateService.selectedDate = selectedDate;
    component.onAddMeeting();
    expect(component.addMeetingButtonClicked.emit).toHaveBeenCalledWith("1930-10-19");
  });
});

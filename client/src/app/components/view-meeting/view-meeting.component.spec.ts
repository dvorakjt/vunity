import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DateTime } from 'luxon';
import { Meeting } from 'src/app/models/meeting.model';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';
import { LoadingServiceStub } from 'src/app/tests/mocks/LoadingServiceStub';

import { ViewMeetingComponent } from './view-meeting.component';

describe('ViewMeetingComponent', () => {
  let component: ViewMeetingComponent;
  let fixture: ComponentFixture<ViewMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewMeetingComponent ],
      imports: [FontAwesomeModule],
      providers: [
        {provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub},
        {provide: LoadingService, useClass: LoadingServiceStub}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the backbutton when showBackButton is true.', () => {
    const backButton = fixture.nativeElement.getElementsByClassName('btnTransparent')[0];
    const transparentButtons = fixture.nativeElement.getElementsByClassName('btnTransparent');
    expect(transparentButtons.length).toBe(2);
  });

  it('should not render the backbutton when showBackButton is false.', () => {
    component.showBackButton = false;
    fixture.detectChanges();
    const transparentButtons = fixture.nativeElement.getElementsByClassName('btnTransparent');
    expect(transparentButtons.length).toBe(1);
  });

  it('should emit an event when onGoBack is called.', () => {
    spyOn(component.backButtonClicked, 'emit');
    component.onGoBack();
    expect(component.backButtonClicked.emit).toHaveBeenCalled();
  });

  it('should call onGoBack when the back button is clicked.', () => {
    spyOn(component, 'onGoBack');
    const backButton = fixture.nativeElement.querySelector('button');
    backButton.click();
    expect(component.onGoBack).toHaveBeenCalled();
  });

  it('should emit an event when onEnterEditMode is called.', () => {
    spyOn(component.editModeActivated, 'emit');
    component.onEnterEditMode();
    expect(component.editModeActivated.emit).toHaveBeenCalled();
  });

  it('should call onEnterEditMode when the edit button is clicked.', () => {
    spyOn(component, 'onEnterEditMode');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    for(let button of buttons) {
      if(button.textContent === 'Edit') button.click();
    }
    expect(component.onEnterEditMode).toHaveBeenCalled();
  });

  it('should return a string in the appropriate format when getMeetingDateTime is called.', () => {
    const meeting = new Meeting (
      '1', 
      'Land on the Moon', 
      'Apollo 11', 
      13, 
      DateTime.fromObject({year: 1969, month: 7, day: 20, hour: 20, minute: 5}).toISO(), 
      ['Neil Armstrong', 'Buzz Aldrin', 'Michael Collins', 'Charles Duke', 'Pete Conrad'],
      "1"
    );
    component.meeting = meeting;
    expect(component.getMeetingDateTime()).toContain('July 20, 1969 at 8:05 PM');
  });

  it('should return an empty string when getMeetingDateTime is called without a meeting.', () => {
    expect(component.getMeetingDateTime()).toBe('');
  });

  it('should subscribe to activeMeetingService.meetingStatusChanged when onStart is called.', () => {
    spyOn(component.activeMeetingService.meetingStatusChanged, 'subscribe');
    const meeting = new Meeting (
      '1', 
      'Land on the Moon', 
      'Apollo 11', 
      13, 
      DateTime.fromObject({year: 1969, month: 7, day: 20, hour: 20, minute: 5}).toISO(), 
      ['Neil Armstrong', 'Buzz Aldrin', 'Michael Collins', 'Charles Duke', 'Pete Conrad'],
      "1"
    );
    component.meeting = meeting;
    component.onStart();
    expect(component.activeMeetingService.meetingStatusChanged.subscribe).toHaveBeenCalled();
  });

  it('should subscribe to activeMeetingService.errorEmitter when onStart is called.', () => {
    spyOn(component.activeMeetingService.errorEmitter, 'subscribe');
    const meeting = new Meeting (
      '1', 
      'Land on the Moon', 
      'Apollo 11', 
      13, 
      DateTime.fromObject({year: 1969, month: 7, day: 20, hour: 20, minute: 5}).toISO(), 
      ['Neil Armstrong', 'Buzz Aldrin', 'Michael Collins', 'Charles Duke', 'Pete Conrad'],
      "1"
    );
    component.meeting = meeting;
    component.onStart();
    expect(component.activeMeetingService.errorEmitter.subscribe).toHaveBeenCalled();
  });

  it('should set loading to true and call activeMeetingService.authenticateAsHost when onStart is called.', () => {
    expect(component.loadingService.isLoading).toBeFalse();
    
    spyOn(component.activeMeetingService, 'authenticateAsHost');

    const meeting = new Meeting (
      '1', 
      'Land on the Moon', 
      'Apollo 11', 
      13, 
      DateTime.fromObject({year: 1969, month: 7, day: 20, hour: 20, minute: 5}).toISO(), 
      ['Neil Armstrong', 'Buzz Aldrin', 'Michael Collins', 'Charles Duke', 'Pete Conrad'],
      "1"
    );
    component.meeting = meeting;
    component.onStart();

    expect(component.loadingService.isLoading).toBeTrue();
    expect(component.activeMeetingService.authenticateAsHost).toHaveBeenCalled();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MeetingDTO } from 'src/app/models/meeting-dto.model';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { LoadingServiceStub } from 'src/app/tests/mocks/LoadingServiceStub';
import { MeetingsServiceStub } from 'src/app/tests/mocks/MeetingsServiceStub';

import { NewMeetingComponent } from './new-meeting.component';

describe('NewMeetingComponent', () => {
  let component: NewMeetingComponent;
  let fixture: ComponentFixture<NewMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewMeetingComponent ],
      imports: [ReactiveFormsModule, FormsModule, FontAwesomeModule],
      providers: [
        {provide: MeetingsService, useClass: MeetingsServiceStub},
        {provide: DateTimeService},
        {provide: LoadingService, useClass : LoadingServiceStub}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the create meeting form if succeeded is false.', () => {
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
  });

  it('should render the success div if succeeded is true.', () => {
    component.succeeded = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p').textContent).toBe('Success! The meeting was created and invitations were emailed to your guests.');
  });

  it('should set a default password on init.', () => {
    spyOn(component, 'getRandomPassword').and.returnValue('mySecretPassword');
    component.ngOnInit();
    expect(component.newMeetingForm.value.password).toBe('mySecretPassword');
  });

  it('should set the date of a form when a date has been provided as input.', () => {
    component.date = '2023-01-04';
    component.ngOnInit();
    expect(component.newMeetingForm.value.startDateTime).toBe('2023-01-04T12:00');
  });
  
  it('setDefaultDate should return the provided date + T12:00 if the date is a valid ISO string.', () => {
    component.date = '2023-01-05';
    const formattedDate = component.setDefaultDate();
    expect(formattedDate).toBe('2023-01-05T12:00');
  });

  it('should return a password that is 8 characters long.', () => {
    expect(component.getRandomPassword().length).toBe(8);
  });

  it('should set guestEmailError to \'Please enter a valid email address.\' when no email address is entered and addGuest is called.', () => {
    const addGuestButton = fixture.nativeElement.querySelectorAll('button')[1];
    addGuestButton.click();
    expect(component.guestEmailError).toBe('Please enter a valid email address.');
  }); 

  it('should set guestEmailError to \'Please enter a valid email address.\' when an invalid email address is entered and addGuest is called.', () => {
    component.guestEmail = 'not a valid email';
    const addGuestButton = fixture.nativeElement.querySelectorAll('button')[1];
    addGuestButton.click();
    expect(component.guestEmailError).toBe('Please enter a valid email address.');
  }); 

  it('should set guestEmailError to \'Guest email already added.\' when the email address already exists in guests.', () => {
    component.guests.add('testuser@example.com');
    component.guestEmail = 'testuser@example.com';
    const addGuestButton = fixture.nativeElement.querySelectorAll('button')[1];
    addGuestButton.click();
    expect(component.guestEmailError).toBe('Guest email already added.');
  });

  it('should add a valid guest email that does not already exist in guests.', () => {
    expect(component.guests.size).toBe(0);
    component.guestEmail = 'testuser@example.com';
    const addGuestButton = fixture.nativeElement.querySelectorAll('button')[1];
    addGuestButton.click();
    expect(component.guests.size).toBe(1);
    expect(component.guests.has('testuser@example.com')).toBe(true);
  });

  it('should remove a guest that exists in guests.', () => {
    component.guests.add('testuser@example.com');
    expect(component.guests.size).toBe(1);
    expect(component.guests.has('testuser@example.com')).toBe(true);

    fixture.detectChanges();

    const removeGuestBtn = fixture.nativeElement.getElementsByClassName('btnDanger')[0];
    removeGuestBtn.click();

    expect(component.guests.size).toBe(0);
    expect(component.guests.has('testuser@example.com')).toBe(false);
  });

  it('should call meetingsService.createMeeting when the form is valid.', () => {
    spyOn(component.meetingsService, 'createMeeting');
    component.newMeetingForm.setValue({
      title: 'My Title',
      password: 'mySecretPassword',
      duration: 60,
      startDateTime: '2012-04-01T15:30'
    });
    const buttons = fixture.nativeElement.querySelectorAll('button');
    for(let button of buttons) {
      if(button.textContent === 'Create Meeting') button.click();
    }
    expect(component.meetingsService.createMeeting).toHaveBeenCalledWith(
      new MeetingDTO('My Title', new DateTimeService().getTimeInMillis('2012-04-01T15:30'), 60, 'mySecretPassword', [])
    );
  });

  it('should not call meetingsService.createMeeting when the form is invalid.', () => {
    spyOn(component.meetingsService, 'createMeeting');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    for(let button of buttons) {
      if(button.textContent === 'Create Meeting') button.click();
    }
    expect(component.meetingsService.createMeeting).not.toHaveBeenCalled();
  });

  it('should set succeeded to true and loadingService.isLoading to false when a meeting is successfully created.', () => {
    expect(component.loadingService.isLoading).toBe(false);

    component.newMeetingForm.setValue({
      title: 'My Title',
      password: 'mySecretPassword',
      duration: 60,
      startDateTime: '2012-04-01T15:30'
    });
    const buttons = fixture.nativeElement.querySelectorAll('button');
    for(let button of buttons) {
      if(button.textContent === 'Create Meeting') button.click();
    }

    expect(component.succeeded).toBe(false);
    expect(component.loadingService.isLoading).toBe(true);

    component.meetingsService.apiCall.emit({success: true, message: 'succeeded'});

    expect(component.succeeded).toBe(true);
    expect(component.loadingService.isLoading).toBe(false);
  });

  it('should set serverError to \'There was a problem creating the meeting.\' and loadingService.isLoading to false when createMeeting fails.', () => {
    expect(component.loadingService.isLoading).toBe(false);
    expect(component.serverError).toBe('');

    component.newMeetingForm.setValue({
      title: 'Failed Meeting',
      password: 'mySecretPassword',
      duration: 60,
      startDateTime: '2012-04-01T15:30'
    });

    const buttons = fixture.nativeElement.querySelectorAll('button');
    for(let button of buttons) {
      if(button.textContent === 'Create Meeting') button.click();
    }

    expect(component.loadingService.isLoading).toBe(true);

    component.meetingsService.apiCall.error('failed');

    expect(component.serverError).toBe('There was a problem creating the meeting.');
    expect(component.loadingService.isLoading).toBe(false);
  });

  it('should refresh the password without changing other values.', () => {
    spyOn(component, 'getRandomPassword').and.returnValue('newPassword');

    component.newMeetingForm.setValue({
      title: 'Only Password Should Change',
      password: 'oldPassword',
      duration: 60,
      startDateTime: '2012-04-01T15:30'
    });

    const refreshButton = fixture.nativeElement.querySelector('button');
    refreshButton.click();

    expect(component.newMeetingForm.value.password).toBe('newPassword');
  });

  it('should reset the form when the OK button is clicked.', () => {
    component.newMeetingForm.setValue({
      title: 'This should be reset',
      password: 'password',
      duration: 60,
      startDateTime: '2012-04-01T15:30'
    });

    component.succeeded = true;
    fixture.detectChanges();

    const resetButton = fixture.nativeElement.querySelector('button');
    resetButton.click();

    expect(component.newMeetingForm.value).toEqual({
      title: null,
      password: null,
      duration: null,
      startDateTime: null
    });
    expect(component.succeeded).toBe(false);
  });
});

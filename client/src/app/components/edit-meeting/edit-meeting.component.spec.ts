import { SimpleChange } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { DateTime } from 'luxon';
import { Meeting } from 'src/app/models/meeting.model';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { MeetingsServiceStub } from 'src/app/tests/mocks/MeetingsServiceStub';
import { LoadingServiceStub } from 'src/app/tests/mocks/LoadingServiceStub';

import { EditMeetingComponent } from './edit-meeting.component';

describe('EditMeetingComponent', () => {
  let component: EditMeetingComponent;
  let fixture: ComponentFixture<EditMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditMeetingComponent ],
      imports: [ReactiveFormsModule],
      providers: [
        {provide: DateTimeService, useClass: DateTimeService},
        {provide: MeetingsService, useClass: MeetingsServiceStub},
        {provide: LoadingService, useClass: LoadingServiceStub}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update the values of the editMeetingForm fields when a meeting value has been provided.', () => {
    const meeting = new Meeting('1', 'Title', 'password', 45, DateTime.fromObject({year: 1903, month: 12, day: 17}).toISO(), [], '1');
    component.meeting = meeting;

    component.ngOnChanges({
      meeting: new SimpleChange(undefined, meeting, true)
    });

    expect(component.editMeetingForm.value.title).toBe('Title');
    expect(component.editMeetingForm.value.duration).toBe(45);
    expect(component.editMeetingForm.value.startDateTime).toBe('1903-12-17T00:00');
  });

  it('should call meetingService.deleteMeeting when onDelete is called and window.confirm returns true.', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component.meetingsService, 'deleteMeeting')
    const meeting = new Meeting('1', 'Title', 'password', 45, DateTime.fromObject({year: 1903, month: 12, day: 17}).toISO(), [], '1');
    component.meeting = meeting;
    component.onDelete();
    expect(component.meetingsService.deleteMeeting).toHaveBeenCalledWith(meeting.id);
  });

  it('should not call meetingsService.deleteMeeting when onDelete is called and window.confirm returns false.', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    spyOn(component.meetingsService, 'deleteMeeting')
    const meeting = new Meeting('1', 'Title', 'password', 45, DateTime.fromObject({year: 1903, month: 12, day: 17}).toISO(), [], '1');
    component.meeting = meeting;
    component.onDelete();
    expect(component.meetingsService.deleteMeeting).not.toHaveBeenCalled();
  });

  it('should set delete succeeded to true and loadingService.isLoading to false when a meeting is successfully deleted.', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component.meetingsService, 'deleteMeeting').and.returnValue(Promise.resolve());
    const meeting = new Meeting('1', 'Title', 'password', 45, DateTime.fromObject({year: 1903, month: 12, day: 17}).toISO(), [], '1');
    component.meeting = meeting;
    component.onDelete();
    tick();
    expect(component.deleteSucceeded).toBe(true);
    expect(component.loadingService.isLoading).toBe(false);
  }));

  it('should set the serverErrorMessage and loadingService.isLoading to false when meetingsService fails to delete a meeting.', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component.meetingsService, 'deleteMeeting').and.returnValue(Promise.reject());
    const meeting = new Meeting('1', 'Title', 'password', 45, DateTime.fromObject({year: 1903, month: 12, day: 17}).toISO(), [], '1');
    component.meeting = meeting;
    component.onDelete();
    tick();
    expect(component.serverError).toBe('There was a problem deleting the meeting.');
    expect(component.loadingService.isLoading).toBe(false);
  }));

  it('should call meetingsService.updateMeeting when all fields are valid.', () => {
    spyOn(component.meetingsService, 'updateMeeting');

    const meeting = new Meeting('1', 'Title', 'password', 45, DateTime.fromObject({year: 1903, month: 12, day: 17}).toISO(), [], '1');
    component.meeting = meeting;
    component.ngOnChanges({
      meeting: new SimpleChange(undefined, meeting, true)
    });

    component.onSubmit();

    expect(component.meetingsService.updateMeeting).toHaveBeenCalled();
  });

  it('should set editSucceeded to true and loadingService.isLoading to false when meetingService.updateMeeting succeeds.', fakeAsync(() => {
    spyOn(component.meetingsService, 'updateMeeting').and.returnValue(Promise.resolve());

    const meeting = new Meeting('1', 'Title', 'password', 45, DateTime.fromObject({year: 1903, month: 12, day: 17}).toISO(), [], '1');
    component.meeting = meeting;
    component.ngOnChanges({
      meeting: new SimpleChange(undefined, meeting, true)
    });

    component.onSubmit();

    tick();

    expect(component.editSucceeded).toBe(true);
    expect(component.loadingService.isLoading).toBe(false);
  }));

  it('should set the serverError to an error message and loadingService.isLoading to false when meetingService.updateMeeting fails.', fakeAsync(() => {
    spyOn(component.meetingsService, 'updateMeeting').and.returnValue(Promise.reject());

    const meeting = new Meeting('1', 'Title', 'password', 45, DateTime.fromObject({year: 1903, month: 12, day: 17}).toISO(), [], '1');
    component.meeting = meeting;
    component.ngOnChanges({
      meeting: new SimpleChange(undefined, meeting, true)
    });

    component.onSubmit();

    tick();

    expect(component.serverError).toBe('There was a problem updating the meeting.');
    expect(component.loadingService.isLoading).toBe(false);
  }));

  it('should emit an event when onEnterViewMode is called.', () => {
    spyOn(component.viewModeActivated, 'emit');
    fixture.nativeElement.querySelector('button').click();
    expect(component.viewModeActivated.emit).toHaveBeenCalled();
  });
});

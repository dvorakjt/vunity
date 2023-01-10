import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NewMeetingComponent } from 'src/app/components/new-meeting/new-meeting.component';
import { DateTimeService } from 'src/app/services/date-time/date-time.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { ActivatedRouteStub } from 'src/app/tests/mocks/ActivatedRouteStub';
import { LoadingServiceStub } from 'src/app/tests/mocks/LoadingServiceStub';
import { MeetingsServiceStub } from 'src/app/tests/mocks/MeetingsServiceStub';

import { NewMeetingPageComponent } from './new-meeting-page.component';

describe('NewMeetingPageComponent', () => {
  let component: NewMeetingPageComponent;
  let fixture: ComponentFixture<NewMeetingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, FontAwesomeModule],
      providers: [
        {provide: ActivatedRoute, useClass: ActivatedRouteStub},
        {provide: MeetingsService, useClass: MeetingsServiceStub},
        {provide: DateTimeService},
        {provide: LoadingService, useClass : LoadingServiceStub}
      ],
      declarations: [ NewMeetingPageComponent, NewMeetingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewMeetingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

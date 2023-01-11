import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateTime } from 'luxon';
import { DateViewComponent } from 'src/app/components/date-view/date-view.component';
import { Meeting } from 'src/app/models/meeting.model';

import { ViewDatePageComponent } from './view-date-page.component';

describe('ViewDatePageComponent', () => {
  let component: ViewDatePageComponent;
  let fixture: ComponentFixture<ViewDatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDatePageComponent, DateViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call router.navigateByUrl when onMeetingSelected is called.', () => {
    spyOn(component.router, 'navigateByUrl');
    const meeting = new Meeting("1", "Title", "password", 60, DateTime.now().toISO(), [], "2");
    component.onMeetingSelected(meeting);
    expect(component.router.navigateByUrl).toHaveBeenCalledWith('/meeting?id=1');
  });

  it('should location.back() when onGoBack() is called.', () => {
    spyOn(component.location, 'back');
    component.onGoBack();
    expect(component.location.back).toHaveBeenCalled();
  })

  it('should call router.navigateByUrl when onAddMeeting is called.', () => {
    spyOn(component.router, 'navigateByUrl');
    component.onAddMeeting('2022-05-12');
    expect(component.router.navigateByUrl).toHaveBeenCalledWith('/newmeeting?date=2022-05-12');
  });
});

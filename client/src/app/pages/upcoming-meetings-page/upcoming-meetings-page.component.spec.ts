import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpcomingMeetingsComponent } from 'src/app/components/upcoming-meetings/upcoming-meetings.component';

import { UpcomingMeetingsPageComponent } from './upcoming-meetings-page.component';

describe('UpcomingMeetingsPageComponent', () => {
  let component: UpcomingMeetingsPageComponent;
  let fixture: ComponentFixture<UpcomingMeetingsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpcomingMeetingsPageComponent, UpcomingMeetingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpcomingMeetingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

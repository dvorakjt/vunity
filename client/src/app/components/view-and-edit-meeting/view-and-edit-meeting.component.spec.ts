import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAndEditMeetingComponent } from './view-and-edit-meeting.component';

describe('ViewAndEditMeetingComponent', () => {
  let component: ViewAndEditMeetingComponent;
  let fixture: ComponentFixture<ViewAndEditMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAndEditMeetingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAndEditMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

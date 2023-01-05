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

  it('should render <app-view-meeting/> if !isEditing.', () => {
    const appViewMeeting = fixture.nativeElement.querySelector('app-view-meeting');
    expect(appViewMeeting).toBeTruthy();
  });

  it('should not render <app-edit-meeting/> if !isEditing.', () => {
    const appEditMeeting = fixture.nativeElement.querySelector('app-edit-meeting');
    expect(appEditMeeting).toBeFalsy();
  });

  it('should render <app-edit-meeting/> if isEditing.', () => {
    component.isEditing = true;
    fixture.detectChanges();
    const appEditMeeting = fixture.nativeElement.querySelector('app-edit-meeting');
    expect(appEditMeeting).toBeTruthy();
  });

  it('should not render <app-view-meeting/> if isEditing.', () => {
    component.isEditing = true;
    fixture.detectChanges();
    const appViewMeeting = fixture.nativeElement.querySelector('app-view-meeting');
    expect(appViewMeeting).toBeFalsy();
  });
});

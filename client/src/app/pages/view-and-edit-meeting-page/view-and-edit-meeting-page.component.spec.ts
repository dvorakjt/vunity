import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAndEditMeetingPageComponent } from './view-and-edit-meeting-page.component';

describe('ViewAndEditMeetingPageComponent', () => {
  let component: ViewAndEditMeetingPageComponent;
  let fixture: ComponentFixture<ViewAndEditMeetingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAndEditMeetingPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAndEditMeetingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

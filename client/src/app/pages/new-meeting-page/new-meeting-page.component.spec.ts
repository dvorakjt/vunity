import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMeetingPageComponent } from './new-meeting-page.component';

describe('NewMeetingPageComponent', () => {
  let component: NewMeetingPageComponent;
  let fixture: ComponentFixture<NewMeetingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewMeetingPageComponent ]
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

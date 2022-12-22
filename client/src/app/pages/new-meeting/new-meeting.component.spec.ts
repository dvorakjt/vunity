import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMeetingComponent } from './new-meeting.component';

describe('NewMeetingComponent', () => {
  let component: NewMeetingComponent;
  let fixture: ComponentFixture<NewMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewMeetingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

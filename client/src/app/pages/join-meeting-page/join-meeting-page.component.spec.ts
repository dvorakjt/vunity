import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinMeetingPageComponent } from './join-meeting-page.component';

describe('JoinMeetingPageComponent', () => {
  let component: JoinMeetingPageComponent;
  let fixture: ComponentFixture<JoinMeetingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoinMeetingPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinMeetingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NewMeetingComponent } from 'src/app/components/new-meeting/new-meeting.component';
import { ActivatedRouteStub } from 'src/app/tests/mocks/ActivatedRouteStub';

import { NewMeetingPageComponent } from './new-meeting-page.component';

describe('NewMeetingPageComponent', () => {
  let component: NewMeetingPageComponent;
  let fixture: ComponentFixture<NewMeetingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{provide: ActivatedRoute, useClass: ActivatedRouteStub}],
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

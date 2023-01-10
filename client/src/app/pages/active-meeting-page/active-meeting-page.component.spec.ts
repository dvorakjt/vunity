import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveMeetingToolbarComponent } from 'src/app/components/active-meeting-toolbar/active-meeting-toolbar.component';
import { ChatMessagesComponent } from 'src/app/components/chat-messages/chat-messages.component';
import { PeerThumbnailsComponent } from 'src/app/components/peer-thumbnails/peer-thumbnails.component';
import { SpeakerViewComponent } from 'src/app/components/speaker-view/speaker-view.component';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';

import { ActiveMeetingPageComponent } from './active-meeting-page.component';

describe('ActiveMeetingPageComponent', () => {
  let component: ActiveMeetingPageComponent;
  let fixture: ComponentFixture<ActiveMeetingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub}],
      declarations: [ ActiveMeetingPageComponent, SpeakerViewComponent, PeerThumbnailsComponent, ChatMessagesComponent, ActiveMeetingToolbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveMeetingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

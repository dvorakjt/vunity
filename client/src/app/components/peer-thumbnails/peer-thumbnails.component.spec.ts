import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';
import { VideoComponent } from '../video/video.component';

import { PeerThumbnailsComponent } from './peer-thumbnails.component';

describe('PeerThumnailsComponent', () => {
  let component: PeerThumbnailsComponent;
  let fixture: ComponentFixture<PeerThumbnailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeerThumbnailsComponent, VideoComponent ],
      providers: [{provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeerThumbnailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

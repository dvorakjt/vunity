import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LocalPeer } from 'src/app/models/local-peer.model';

import { VideoComponent } from './video.component';

describe('VideoComponent', () => {
  let component: VideoComponent;
  let fixture: ComponentFixture<VideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoComponent ],
      imports: [FontAwesomeModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect changes when it receives an audioToggled event.', () => {
    spyOn(component.changeDetector, 'detectChanges');
    component.peer = new LocalPeer("test peer");
    component.ngOnInit();
    component.peer.audioToggled.next();
    expect(component.changeDetector.detectChanges).toHaveBeenCalled();
  });

  it('should detect changes when it receives a videoToggled event.', () => {
    spyOn(component.changeDetector, 'detectChanges');
    component.peer = new LocalPeer("test peer");
    component.ngOnInit();
    component.peer.videoToggled.next();
    expect(component.changeDetector.detectChanges).toHaveBeenCalled();
  });

  it('should set isSpeaking when it receives a speech event.', () => {
    expect(component.isSpeaking).toBeFalse();
    component.peer = new LocalPeer("test peer");
    component.ngOnInit();
    component.peer.speechEventEmitter.next(true);
    expect(component.isSpeaking).toBeTrue();
    component.peer.speechEventEmitter.next(false);
    expect(component.isSpeaking).toBeFalse();
  });
});

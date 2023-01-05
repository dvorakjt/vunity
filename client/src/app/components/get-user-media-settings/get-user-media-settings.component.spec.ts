import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LocalPeer } from 'src/app/models/local-peer.model';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';
import { VideoComponent } from '../video/video.component';
import { GetUserMediaSettingsComponent } from './get-user-media-settings.component';

describe('GetUserMediaSettingsComponent', () => {
  let component: GetUserMediaSettingsComponent;
  let fixture: ComponentFixture<GetUserMediaSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetUserMediaSettingsComponent, VideoComponent ],
      imports: [FontAwesomeModule],
      providers: [{provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetUserMediaSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call activeMeetingService.resetMeetingData when onCancel is called.', () => {
    spyOn(component.activeMeetingService, 'resetMeetingData');
    component.onCancel();
    expect(component.activeMeetingService.resetMeetingData).toHaveBeenCalled();
  });

  it('should call onCancel when the cancel button is clicked.', () => {
    spyOn(component, 'onCancel');
    fixture.nativeElement.getElementsByClassName('btnDanger')[0].click();
    expect(component.onCancel).toHaveBeenCalled();
  });

  it('should call activeMeetingService.confirmMediaSettings when onContinue is called.', () => {
    spyOn(component.activeMeetingService, 'confirmMediaSettings');
    component.onContinue();
    expect(component.activeMeetingService.confirmMediaSettings).toHaveBeenCalled();
  });

  it('should call onContinue when the continue button is clicked.', () => {
    spyOn(component, 'onContinue');
    fixture.nativeElement.getElementsByClassName('btnPrimary')[0].click();
    expect(component.onContinue).toHaveBeenCalled();
  });

  it('should call activeMeetingService.setLocalAudioEnabled when radio buttons receive input.', () => {
    spyOn(component.activeMeetingService, 'setLocalAudioEnabled');
    const yesAudioRadioBtn = document.getElementById('yesAudio');
    const noAudioRadioBtn = document.getElementById('noAudio');
    expect(yesAudioRadioBtn).toBeTruthy();
    expect(noAudioRadioBtn).toBeTruthy();
    yesAudioRadioBtn?.click();
    expect(component.activeMeetingService.setLocalAudioEnabled).toHaveBeenCalledWith(true);
    noAudioRadioBtn?.click();
    expect(component.activeMeetingService.setLocalAudioEnabled).toHaveBeenCalledWith(false);
  });

  it('should set radio buttons to correct values depending on activeMeeting.localPeer\'s state.', () => {
    component.activeMeetingService.localPeer = new LocalPeer("test");
    component.activeMeetingService.localPeer.audioEnabled = true;
    component.activeMeetingService.localPeer.videoEnabled = true;
    fixture.detectChanges();

    const yesVideoRadioBtn = document.getElementById('yesVideo') as any;
    const yesAudioRadioBtn = document.getElementById('yesAudio') as any;
    const noVideoRadioBtn = document.getElementById('noVideo') as any;
    const noAudioRadioBtn = document.getElementById('noAudio') as  any;
    
    expect(yesVideoRadioBtn.checked).toBe(true);
    expect(yesAudioRadioBtn.checked).toBe(true);
    expect(noVideoRadioBtn.checked).toBe(false);
    expect(noAudioRadioBtn.checked).toBe(false);

    component.activeMeetingService.localPeer.audioEnabled = false;
    component.activeMeetingService.localPeer.videoEnabled = false;
    fixture.detectChanges();

    expect(yesVideoRadioBtn.checked).toBe(false);
    expect(yesAudioRadioBtn.checked).toBe(false);
    expect(noVideoRadioBtn.checked).toBe(true);
    expect(noAudioRadioBtn.checked).toBe(true);

  });
});

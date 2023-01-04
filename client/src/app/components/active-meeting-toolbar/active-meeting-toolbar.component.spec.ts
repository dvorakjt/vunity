import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';
import { ActiveMeetingToolbarComponent } from './active-meeting-toolbar.component';

describe('ActiveMeetingToolbarComponent', () => {
  let component: ActiveMeetingToolbarComponent;
  let fixture: ComponentFixture<ActiveMeetingToolbarComponent>;

  beforeEach(async () => {
  
    await TestBed.configureTestingModule({
      declarations: [ ActiveMeetingToolbarComponent ],
      providers: [{ provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveMeetingToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to isMobile = false.', () => {
    expect(component.isMobile).toBeFalsy();
  });

  it('should not display any elements of class toolbarButtonMobile when isMobile is false.', () => {
    expect(fixture.nativeElement.getElementsByClassName('toolbarButtonMobile').length).toEqual(0);
  });

  it('should display 5 buttons when isMobile is false.', () => {
    expect(fixture.nativeElement.querySelectorAll('button').length).toEqual(5);
  });

  it('should not display any elements of class toolBarButton when isMobile is true.', () => {
    component.isMobile = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.getElementsByClassName('toolbarButton').length).toEqual(0);
  });

  it('should display 6 buttons when isMobile is true', () => {
    component.isMobile = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('button').length).toEqual(6);
  });

  it('should call activeMeetingService.setLocalAudioEnabled when onToggleMicrophone is called.', () => {
    spyOn(component.activeMeetingService, 'setLocalAudioEnabled');
    component.onToggleMicrophone();
    expect(component.activeMeetingService.setLocalAudioEnabled).toHaveBeenCalled();
  });

  it('should call onToggleMicrophone when the microphone button is clicked.', () => {
    spyOn(component, 'onToggleMicrophone');
    const micButton = fixture.nativeElement.querySelectorAll('button')[0];
    micButton.click();
    expect(component.onToggleMicrophone).toHaveBeenCalled();
  });

  it('should call activeMeetingService.setLocalVideoEnabled when onToggleVideo is called.', () => {
    spyOn(component.activeMeetingService, 'setLocalVideoEnabled');
    component.onToggleVideo();
    expect(component.activeMeetingService.setLocalVideoEnabled).toHaveBeenCalled();
  });

  it('should call onToggleVideo when the video button is clicked.', () => {
    spyOn(component, 'onToggleVideo');
    const videoButton = fixture.nativeElement.querySelectorAll('button')[1];
    videoButton.click();
    expect(component.onToggleVideo).toHaveBeenCalled();
  });

  it('should call activeMeetingService.leave() when onLeaveOrClose is called and confirm is clicked.', () => {
    spyOn(component.activeMeetingService, 'leave');
    spyOn(window, 'confirm').and.returnValue(true);
    component.onLeaveOrClose();
    expect(component.activeMeetingService.leave).toHaveBeenCalled();
  });

  it('should call activeMeetingService.close() when onLeaveOrClose is called, confirm is clicked, and activeMeetingService.isHost is true.', () => {
    spyOn(component.activeMeetingService, 'close');
    spyOn(window, 'confirm').and.returnValue(true);
    component.activeMeetingService.isHost = true;
    component.onLeaveOrClose();
    expect(component.activeMeetingService.close).toHaveBeenCalled();
  });

  it('should not call activeMeetingService.leave when confirm is canceled.', () => {
    spyOn(component.activeMeetingService, 'leave');
    spyOn(window, 'confirm').and.returnValue(false);
    component.onLeaveOrClose();
    expect(component.activeMeetingService.leave).not.toHaveBeenCalled();
  });

  it('should call onLeaveOrClose when the exit button is clicked.', () => {
    spyOn(component, 'onLeaveOrClose');
    const exitButton = fixture.nativeElement.getElementsByClassName('toolbarButton')[4];
    exitButton.click();
    expect(component.onLeaveOrClose).toHaveBeenCalled();
  });

  it('should emit true when onToggleChatMenu is called with a default showChat value of false.', () => {
    spyOn(component.showChatChanged, 'emit');
    component.onToggleChatMenu();
    expect(component.showChatChanged.emit).toHaveBeenCalledWith(true);
  });

  it('should emit false when onToggleChatMenu is called with an initial showChat value of true.', () => {
    spyOn(component.showChatChanged, 'emit');
    component.showChat = true;
    component.onToggleChatMenu();
    expect(component.showChatChanged.emit).toHaveBeenCalledWith(false);
  });

  it('should call onToggleChatMenu when the chatMenu button is clicked when isMobile.', () => {
    spyOn(component, 'onToggleChatMenu');
    component.isMobile = true;
    fixture.detectChanges();
    const chatMenuButton = fixture.nativeElement.querySelectorAll('button')[3];
    chatMenuButton.click();
    expect(component.onToggleChatMenu).toHaveBeenCalled();
  });

  it('should emit an event when onOpenSettingsMenu is called.', () => {
    spyOn(component.showSettingsButtonClicked, 'emit');
    component.onOpenSettingsMenu();
    expect(component.showSettingsButtonClicked.emit).toHaveBeenCalled();
  });

  it('should call onOpenSettingsMenu when the showSettings button is clicked.', () => {
    spyOn(component, 'onOpenSettingsMenu');
    const showSettingsButton = fixture.nativeElement.querySelectorAll('button')[3];
    showSettingsButton.click();
    expect(component.onOpenSettingsMenu).toHaveBeenCalled();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';

import { GetUsernameComponent } from './get-username.component';

describe('GetUsernameComponent', () => {
  let component: GetUsernameComponent;
  let fixture: ComponentFixture<GetUsernameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetUsernameComponent ],
      imports: [FormsModule],
      providers: [{provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetUsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the usernameErrorMessage when onSubmit is called without a username.', () => {
    component.onSubmit();
    expect(component.usernameErrorMessage).toBe('Please enter a name');
  });

  it('should call activeMeetingService.setLocalPeerUsername when onSubmit is called with a username.', () => {
    spyOn(component.activeMeetingService, 'setLocalPeerUsername');
    component.username = 'Mieczyslaw';
    component.onSubmit();
    expect(component.activeMeetingService.setLocalPeerUsername).toHaveBeenCalledWith('Mieczyslaw');
  });

  it('should call activeMeetingService.resetMeetingData() when onCancel() is called.', () => {
    spyOn(component.activeMeetingService, 'resetMeetingData');
    component.onCancel();
    expect(component.activeMeetingService.resetMeetingData).toHaveBeenCalled();
  });

  it('should call onCancel when the cancel button is clicked.', () => {
    spyOn(component, 'onCancel');
    const cancelBtn = fixture.nativeElement.getElementsByClassName('btnDanger')[0];
    cancelBtn.click();
    expect(component.onCancel).toHaveBeenCalled();
  });

});

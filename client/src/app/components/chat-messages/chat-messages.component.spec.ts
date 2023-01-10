import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { ActiveMeetingServiceStub } from 'src/app/tests/mocks/ActiveMeetingServiceStub';

import { ChatMessagesComponent } from './chat-messages.component';

describe('ChatMessagesComponent', () => {
  let component: ChatMessagesComponent;
  let fixture: ComponentFixture<ChatMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatMessagesComponent ],
      imports: [FormsModule],
      providers: [{provide: ActiveMeetingService, useClass: ActiveMeetingServiceStub}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call scrollToBottomOfMessages when a new message event is received.', () => {
    spyOn(component, 'scrollToBottomOfMessages');
    component.activeMeetingService.newChatMessageReceived.emit();
    expect(component.scrollToBottomOfMessages).toHaveBeenCalled();
  });

  it('should call activeMeetingService.broadCastMessage when onSendMessage is called.', () => {
    spyOn(component.activeMeetingService, 'broadCastMessage');
    component.newMessage = 'Hello there';
    component.onSendMessage();
    expect(component.activeMeetingService.broadCastMessage).toHaveBeenCalledWith('chat', 'Hello there');
  });

  it('should call onSendMessage when the send button is clicked.', () => {
    spyOn(component, 'onSendMessage');
    const sendButton = fixture.nativeElement.querySelector('button');
    sendButton.click();
    expect(component.onSendMessage).toHaveBeenCalled();
  });

  it('should scroll to the bottom of the component when onScrollToBottomOfMessages is called.', () => {
    const messagesContainer = component.messagesContainer;
    component.scrollToBottomOfMessages();
    expect(messagesContainer?.nativeElement.scrollTop).toBe(messagesContainer?.nativeElement.scrollHeight);
  });

  it('should correctly transform links into a tags', () => {
    const link = 'http://www.example.com';
    const aTag = component.replaceLinksWithTags(link);
    expect(aTag).toBe('<a target="_blank" ref="noreferrer" href="http://www.example.com" class="chatLink">http://www.example.com</a>')
  });
});

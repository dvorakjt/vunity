import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';

@Component({
  selector: 'app-chat-messages',
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.scss']
})
export class ChatMessagesComponent implements OnInit, AfterViewInit {
  newMessage = '';

  @ViewChildren('messages') messages?: QueryList<any>;
  @ViewChild('messagesContainer', {static: false}) messagesContainer?:ElementRef;

  constructor(public activeMeetingService:ActiveMeetingService, private changeDetector:ChangeDetectorRef) {}

  ngOnInit(): void {
    this.activeMeetingService.newChatMessageReceived.subscribe({
      next: () => {
        this.changeDetector.detectChanges();
        this.scrollToBottomOfMessages();
      }
    });
  }

  ngAfterViewInit() {
    this.scrollToBottomOfMessages();
    if(this.messages) this.messages.changes.subscribe(this.scrollToBottomOfMessages);
  }

  onSendMessage() {
    this.activeMeetingService.broadCastMessage('chat', this.newMessage);
    this.newMessage = '';
  }
  
  scrollToBottomOfMessages = () => {
    try {
      if(this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } 
    } catch (err) {}
  }

  replaceLinksWithTags(message:string) {
    return message.replace(/http[s]{0,1}:\/\/\S+/g, (address:string) => {
      return `<a target="_blank" ref="noreferrer" href="${address}" class="chatLink">${address}</a>`
    });
  }
}

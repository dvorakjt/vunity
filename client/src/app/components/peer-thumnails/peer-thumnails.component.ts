import { AfterViewInit, Component, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-peer-thumnails',
  templateUrl: './peer-thumnails.component.html',
  styleUrls: ['./peer-thumnails.component.scss']
})
export class PeerThumnailsComponent implements AfterViewInit, OnChanges, OnDestroy{

  scrollUpInterval?:any;
  scrollDownInterval?:any;

  showScrollButtons = false;
  showScrollUp = false;
  showScrollDown = true;

  @ViewChild('outerThumbnailsContainer') outerThumbnailsContainer?:ElementRef;
  @ViewChild('innerThumbnailsContainer') innerThumbnailsContainer?:ElementRef;

  faAngleUp = faAngleUp;
  faAngleDown = faAngleDown;

  scrollThumbnailsWithMouse = false;

  constructor(public activeMeetingService:ActiveMeetingService) {

  }

  ngOnDestroy(): void {
    if(this.scrollUpInterval) clearInterval(this.scrollUpInterval);
    if(this.scrollDownInterval) clearInterval(this.scrollDownInterval);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.showScrollButtons = this.innerThumbnailsContainer ? this.innerThumbnailsContainer.nativeElement.scrollHeight > this.innerThumbnailsContainer.nativeElement.clientHeight : false;
  }

  ngAfterViewInit(): void {
    this.showScrollButtons = this.innerThumbnailsContainer ? this.innerThumbnailsContainer.nativeElement.scrollHeight > this.innerThumbnailsContainer.nativeElement.clientHeight : false;
    document.addEventListener('mousemove', (event) => {
      if(this.scrollThumbnailsWithMouse && this.innerThumbnailsContainer) {
        const thumbnails = document.getElementsByClassName('innerThumbnailsContainer')[0];
        thumbnails.scrollBy(0, event.movementY);
        this.setShowScrollUpAndDown();
      }
    });
  }

  onScrollThumbnails() {
    this.scrollThumbnailsWithMouse = true;
  }

  onStopScrollThumbnails() {
    this.scrollThumbnailsWithMouse = false;
  }

  onScrollUp() {
    this.scrollUpInterval = setInterval(() => {
      const thumbnails = document.getElementsByClassName('innerThumbnailsContainer')[0];
        thumbnails.scrollBy(0, -5);
      this.setShowScrollUpAndDown();
    }, 15);
  }

  onStopScrollUp() {
    if(this.scrollUpInterval) clearInterval(this.scrollUpInterval);
  }

  onScrollDown() {
    this.scrollDownInterval = setInterval(() => {
      const thumbnails = document.getElementsByClassName('innerThumbnailsContainer')[0];
        thumbnails.scrollBy(0, 5);
      this.setShowScrollUpAndDown();
    }, 15);
  }

  onStopScrollDown() {
    if(this.scrollDownInterval) clearInterval(this.scrollDownInterval);
  }

  setShowScrollUpAndDown() {
    const thumbnails = document.getElementsByClassName('innerThumbnailsContainer')[0];
    if(thumbnails.scrollTop === 0) {
      if(this.scrollUpInterval) clearInterval(this.scrollUpInterval);
      this.showScrollUp = false;
    }
    else this.showScrollUp = true;
    if(thumbnails.scrollHeight - thumbnails.scrollTop - thumbnails.clientHeight < 1) {
      if(this.scrollDownInterval) clearInterval(this.scrollDownInterval);
      this.showScrollDown = false;
    }
    else this.showScrollDown = true;
  }
}

import { AfterViewInit, Component, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-peer-thumbnails',
  templateUrl: './peer-thumbnails.component.html',
  styleUrls: ['./peer-thumbnails.component.scss']
})
export class PeerThumbnailsComponent implements OnInit, AfterViewInit, OnDestroy{

  displaySetting = 'oneCol';
  rowHeight = 0;

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
    window.addEventListener('resize', () => {
      this.initializeGrid();
      this.showScrollButtons = this.setShowScrollButtons();
    });
  }
  
  ngOnInit(): void {
    this.activeMeetingService.remotePeerJoinedOrLeft.subscribe(() => {
      this.showScrollButtons = this.setShowScrollButtons();
    });
  }

  ngAfterViewInit(): void {
    this.initializeGrid();
    this.showScrollButtons = this.setShowScrollButtons();
  }

  ngOnDestroy(): void {
    if(this.scrollUpInterval) clearInterval(this.scrollUpInterval);
    if(this.scrollDownInterval) clearInterval(this.scrollDownInterval);
  }

  setShowScrollButtons() {
    if(this.innerThumbnailsContainer) {
      let thumbnailsPerRow;
      if(this.displaySetting === 'oneCol') thumbnailsPerRow = 1;
      else if(this.displaySetting === 'twoCols') thumbnailsPerRow = 2;
      else thumbnailsPerRow = 3;
      const rows = Math.ceil((this.activeMeetingService.remotePeerList.length + 1) / thumbnailsPerRow);
      const totalHeight = rows * this.rowHeight;
      return totalHeight > this.innerThumbnailsContainer.nativeElement.clientHeight;
    }
    return false;
  }

  onScrollUp() {
    this.scrollUpInterval = setInterval(() => {
      console.log('scrolling up');
      const thumbnails = this.innerThumbnailsContainer?.nativeElement;
      if(thumbnails) {
        thumbnails.scrollBy(0, -10);
      }
      this.setShowScrollUpAndDown();
    }, 15);
  }

  onStopScrollUp() {
    if(this.scrollUpInterval) clearInterval(this.scrollUpInterval);
  }

  onScrollDown() {
    this.scrollDownInterval = setInterval(() => {
      console.log('scrolling down');
      const thumbnails = this.innerThumbnailsContainer?.nativeElement;
      if(thumbnails) {
        thumbnails.scrollBy(0, 10);
      }
      this.setShowScrollUpAndDown();
    }, 15);
  }

  onStopScrollDown() {
    if(this.scrollDownInterval) clearInterval(this.scrollDownInterval);
  }

  setShowScrollUpAndDown() {
    const thumbnails = this.innerThumbnailsContainer?.nativeElement;
    if(thumbnails) {
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

  initializeGrid() {
    const thumbnails = this.innerThumbnailsContainer?.nativeElement;
    if(thumbnails && thumbnails.clientWidth) {
      if(thumbnails.clientWidth >= 540) {
        this.displaySetting = 'threeCols';
        this.rowHeight = (thumbnails.clientWidth / (3 * 1.3));
        console.log('three cols');
      } else if(thumbnails.clientWidth >= 360) {
        this.displaySetting = 'twoCols';
        this.rowHeight = (thumbnails.clientWidth / (2 * 1.3));
        console.log('two cols');
      } else {
        this.displaySetting = 'oneCol';
        this.rowHeight = (thumbnails.clientWidth / 1.3);
        console.log('one col');
      }
    }
  }
}

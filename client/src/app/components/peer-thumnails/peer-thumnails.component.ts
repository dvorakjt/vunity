import { AfterViewInit, Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActiveMeetingService } from 'src/app/services/active-meeting/active-meeting.service';

@Component({
  selector: 'app-peer-thumnails',
  templateUrl: './peer-thumnails.component.html',
  styleUrls: ['./peer-thumnails.component.scss']
})
export class PeerThumnailsComponent implements AfterViewInit, OnChanges{

  showScrollButtons = false;

  @ViewChild('outerThumbnailsContainer') outerThumbnailsContainer?:ElementRef;
  @ViewChild('innerThumbnailsContainer') innerThumbnailsContainer?:ElementRef;

  constructor(public activeMeetingService:ActiveMeetingService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.showScrollButtons = this.outerThumbnailsContainer ? this.outerThumbnailsContainer.nativeElement.scrollHeight > this.outerThumbnailsContainer.nativeElement.clientHeight : false;
  }

  ngAfterViewInit(): void {
    this.showScrollButtons = this.outerThumbnailsContainer ? this.outerThumbnailsContainer.nativeElement.scrollHeight > this.outerThumbnailsContainer.nativeElement.clientHeight : false;
  }

}

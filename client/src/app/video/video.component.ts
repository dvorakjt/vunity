import { Component, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnDestroy {
  @Input() username:string = '';
  @Input() stream?:MediaStream;
  @Input() audioEnabled:boolean = false;
  @Input() videoEnabled:boolean = false;
  videoWorker:Worker;

  constructor() {
    this.videoWorker = new Worker('../video-worker.worker')
    this.videoWorker.postMessage(this.stream);
    this.videoWorker.onmessage = (message) => {
      this.audioEnabled = message.data.audioEnabled;
      this.videoEnabled = message.data.videoEnabled;
    }
  }

  ngOnDestroy(): void {
      this.videoWorker.terminate();
  }
}

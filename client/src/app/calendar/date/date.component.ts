import { Component, Input } from '@angular/core';
import { Meeting } from 'src/app/models/meeting.model';

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss']
})
export class DateComponent {
  @Input() date:number = 1;
  @Input() meetings:Meeting[] = [];
}

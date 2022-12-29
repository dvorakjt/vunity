import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Meeting } from 'src/app/models/meeting.model';
import { SelectedDate } from 'src/app/types/selected-date.type';

@Component({
  selector: 'app-calendar-date',
  templateUrl: './calendar-date.component.html',
  styleUrls: ['./calendar-date.component.scss']
})
export class CalendarDateComponent {
  @Input() date:number = 1;
  @Input() meetings:Meeting[] = [];

  @Output() dateSelected = new EventEmitter<SelectedDate>();

  onClick() {
    this.dateSelected.emit({
      date: this.date,
      meetings: this.meetings
    });
  }
}
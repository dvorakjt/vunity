import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SelectedDate } from 'src/app/types/selected-date.type';

@Component({
  selector: 'app-calendar-page',
  templateUrl: './calendar-page.component.html',
  styleUrls: ['./calendar-page.component.scss']
})
export class CalendarPageComponent {
  constructor(public router:Router) {}

  onDateSelected(event:SelectedDate) {
    this.router.navigate(['/viewdate']);
  }
}

import { Component, OnInit } from '@angular/core';
import { SelectedDate } from '../types/selected-date.type';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  onDateSelected(event:SelectedDate) {
    console.log(event);
  }
}

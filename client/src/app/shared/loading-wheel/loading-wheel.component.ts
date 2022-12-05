import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-loading-wheel',
  templateUrl: './loading-wheel.component.html',
  styleUrls: ['./loading-wheel.component.scss']
})
export class LoadingWheelComponent implements OnInit {
  @Input() size = "lg"; //md, sm, xs

  constructor() { }

  ngOnInit(): void {
  }

}

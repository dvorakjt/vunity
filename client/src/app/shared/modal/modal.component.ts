import { Component, OnInit, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  display = false;
  @Input() openModal:EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() modalTitle = '';
  @Input() modalBody = '';

  constructor() { }

  ngOnInit(): void {
    this.openModal.subscribe((status) => {
      this.display = status;
    });
  }

}

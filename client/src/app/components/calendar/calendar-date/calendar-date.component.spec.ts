import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarDateComponent } from './calendar-date.component';

describe('CalendarDateComponent', () => {
  let component: CalendarDateComponent;
  let fixture: ComponentFixture<CalendarDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalendarDateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

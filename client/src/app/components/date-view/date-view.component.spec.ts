import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateViewComponent } from './date-view.component';

describe('DateViewComponent', () => {
  let component: DateViewComponent;
  let fixture: ComponentFixture<DateViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

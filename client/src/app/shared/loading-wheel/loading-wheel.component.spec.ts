import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingWheelComponent } from './loading-wheel.component';

describe('LoadingWheelComponent', () => {
  let component: LoadingWheelComponent;
  let fixture: ComponentFixture<LoadingWheelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingWheelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingWheelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

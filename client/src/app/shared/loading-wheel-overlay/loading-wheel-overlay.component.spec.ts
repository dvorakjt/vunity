import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingWheelComponent } from '../loading-wheel/loading-wheel.component';

import { LoadingWheelOverlayComponent } from './loading-wheel-overlay.component';

describe('LoadingWheelOverlayComponent', () => {
  let component: LoadingWheelOverlayComponent;
  let fixture: ComponentFixture<LoadingWheelOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingWheelOverlayComponent, LoadingWheelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingWheelOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

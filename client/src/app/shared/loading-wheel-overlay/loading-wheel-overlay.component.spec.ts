import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingWheelOverlayComponent } from './loading-wheel-overlay.component';

describe('LoadingWheelOverlayComponent', () => {
  let component: LoadingWheelOverlayComponent;
  let fixture: ComponentFixture<LoadingWheelOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingWheelOverlayComponent ]
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

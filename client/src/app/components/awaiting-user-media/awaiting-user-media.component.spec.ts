import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingWheelComponent } from 'src/app/shared/loading-wheel/loading-wheel.component';

import { AwaitingUserMediaComponent } from './awaiting-user-media.component';

describe('AwaitingUserMediaComponent', () => {
  let component: AwaitingUserMediaComponent;
  let fixture: ComponentFixture<AwaitingUserMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AwaitingUserMediaComponent, LoadingWheelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AwaitingUserMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

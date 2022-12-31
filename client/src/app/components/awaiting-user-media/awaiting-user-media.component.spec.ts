import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwaitingUserMediaComponent } from './awaiting-user-media.component';

describe('AwaitingUserMediaComponent', () => {
  let component: AwaitingUserMediaComponent;
  let fixture: ComponentFixture<AwaitingUserMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AwaitingUserMediaComponent ]
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

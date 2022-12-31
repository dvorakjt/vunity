import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwaitingHostComponent } from './awaiting-host.component';

describe('AwaitingHostComponent', () => {
  let component: AwaitingHostComponent;
  let fixture: ComponentFixture<AwaitingHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AwaitingHostComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AwaitingHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

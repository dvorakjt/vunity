import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalVideoComponent } from './local-video.component';

describe('LocalVideoComponent', () => {
  let component: LocalVideoComponent;
  let fixture: ComponentFixture<LocalVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocalVideoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocalVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

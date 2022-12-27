import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakerViewComponent } from './speaker-view.component';

describe('SpeakerViewComponent', () => {
  let component: SpeakerViewComponent;
  let fixture: ComponentFixture<SpeakerViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpeakerViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeakerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaSettingsModalComponent } from './media-settings-modal.component';

describe('MediaSettingsModalComponent', () => {
  let component: MediaSettingsModalComponent;
  let fixture: ComponentFixture<MediaSettingsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaSettingsModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaSettingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

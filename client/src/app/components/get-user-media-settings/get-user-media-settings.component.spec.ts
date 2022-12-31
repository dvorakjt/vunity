import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetUserMediaSettingsComponent } from './get-user-media-settings.component';

describe('GetUserMediaSettingsComponent', () => {
  let component: GetUserMediaSettingsComponent;
  let fixture: ComponentFixture<GetUserMediaSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetUserMediaSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetUserMediaSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

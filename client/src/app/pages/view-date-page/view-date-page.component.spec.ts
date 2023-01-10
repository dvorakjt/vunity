import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateViewComponent } from 'src/app/components/date-view/date-view.component';

import { ViewDatePageComponent } from './view-date-page.component';

describe('ViewDatePageComponent', () => {
  let component: ViewDatePageComponent;
  let fixture: ComponentFixture<ViewDatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDatePageComponent, DateViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingsListComponent } from './meetings-list.component';

describe('MeetingsListComponent', () => {
  let component: MeetingsListComponent;
  let fixture: ComponentFixture<MeetingsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeetingsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

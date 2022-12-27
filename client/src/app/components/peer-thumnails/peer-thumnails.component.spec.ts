import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeerThumnailsComponent } from './peer-thumnails.component';

describe('PeerThumnailsComponent', () => {
  let component: PeerThumnailsComponent;
  let fixture: ComponentFixture<PeerThumnailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeerThumnailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeerThumnailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

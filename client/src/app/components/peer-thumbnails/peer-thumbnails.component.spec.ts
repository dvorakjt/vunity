import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeerThumbnailsComponent } from './peer-thumbnails.component';

describe('PeerThumnailsComponent', () => {
  let component: PeerThumbnailsComponent;
  let fixture: ComponentFixture<PeerThumbnailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeerThumbnailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeerThumbnailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

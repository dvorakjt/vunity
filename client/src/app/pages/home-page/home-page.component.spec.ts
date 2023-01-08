import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { HttpClientStub } from 'src/app/tests/mocks/HttpClientStub';
import { LoadingServiceStub } from 'src/app/tests/mocks/LoadingServiceStub';
import { RecaptchaV3ServiceStub } from 'src/app/tests/mocks/RecaptchaV3ServiceStub';

import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: LoadingService, useClass: LoadingServiceStub}, 
        {provide: ReCaptchaV3Service, useClass: RecaptchaV3ServiceStub},
        {provide: HttpClient, useClass: HttpClientStub}
      ],
      declarations: [ HomePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

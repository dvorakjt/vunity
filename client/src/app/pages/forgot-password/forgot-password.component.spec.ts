import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { HttpClientStub } from 'src/app/tests/mocks/HttpClientStub';
import { RecaptchaV3ServiceStub } from 'src/app/tests/mocks/RecaptchaV3ServiceStub';

import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: HttpClient, useClass: HttpClientStub},
        {provide: ReCaptchaV3Service, useClass: RecaptchaV3ServiceStub}
      ],
      declarations: [ ForgotPasswordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

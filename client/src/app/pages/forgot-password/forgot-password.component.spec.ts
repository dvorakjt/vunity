import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { of, throwError } from 'rxjs';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { HttpClientStub } from 'src/app/tests/mocks/HttpClientStub';
import { LoadingServiceStub } from 'src/app/tests/mocks/LoadingServiceStub';
import { RecaptchaV3ServiceStub } from 'src/app/tests/mocks/RecaptchaV3ServiceStub';

import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: HttpClient, useClass: HttpClientStub},
        {provide: ReCaptchaV3Service, useClass: RecaptchaV3ServiceStub},
        {provide: LoadingService, useClass: LoadingServiceStub}
      ],
      imports: [FormsModule],
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

  it('should set the email error message and NOT call recaptchaV3Service.execute when email is an empty string.', () => {
    spyOn(component.recaptchaV3Service, 'execute');
    component.email = '';
    component.onRequestPasswordReset();
    expect(component.emailErrorMessage).toBe('Please enter a valid email address.');
    expect(component.recaptchaV3Service.execute).not.toHaveBeenCalled();
  });

  it('should set the email error message and NOT call recaptchaV3Service.execute when email is invalid.', () => {
    spyOn(component.recaptchaV3Service, 'execute');
    component.email = 'not a valid email';
    component.onRequestPasswordReset();
    expect(component.emailErrorMessage).toBe('Please enter a valid email address.');
    expect(component.recaptchaV3Service.execute).not.toHaveBeenCalled();
  });
  
  it('should set succeeded to true when successful calls are made to recaptchaV3Service.execute and http.post.', () => {
    spyOn(component.recaptchaV3Service, 'execute').and.returnValue(of('token'));
    spyOn(component.http, 'post').and.returnValue(of({status: 200}));
    component.email = 'valid@example.com';
    component.onRequestPasswordReset();
    expect(component.recaptchaV3Service.execute).toHaveBeenCalled();
    expect(component.http.post).toHaveBeenCalled();
    expect(component.succeeded).toBeTrue();
  });

  it('should set serverErrorMessage when recaptchaV3Service.execute is successful but http.post returns with 500 error.', () => {
    spyOn(component.recaptchaV3Service, 'execute').and.returnValue(of('token'));
    spyOn(component.http, 'post').and.returnValue(throwError(() => {return {status: 500}}));
    component.email = 'valid@example.com';
    component.onRequestPasswordReset();
    expect(component.recaptchaV3Service.execute).toHaveBeenCalled();
    expect(component.http.post).toHaveBeenCalled();
    expect(component.serverErrorMessage).toBe("We're sorry. We found your account but could not reach the email address you provided in order to send you a password reset link.");
  });

  it('should set serverErrorMessage when recaptchaV3Service.execute is successful but http.post is not.', () => {
    spyOn(component.recaptchaV3Service, 'execute').and.returnValue(of('token'));
    spyOn(component.http, 'post').and.returnValue(throwError(() => {return {status: 404}}));
    component.email = 'valid@example.com';
    component.onRequestPasswordReset();
    expect(component.recaptchaV3Service.execute).toHaveBeenCalled();
    expect(component.http.post).toHaveBeenCalled();
    expect(component.serverErrorMessage).toBe("We're sorry, we couldn't send you a reset code. Please ensure that your email address is entered correctly.");
  });

  it('should set the serverErrorMessage when generating a recaptchaToken fails.', () => {
    spyOn(component.recaptchaV3Service, 'execute').and.returnValue(throwError(() => new Error()));
    component.email = 'valid@example.com';
    component.onRequestPasswordReset();
    expect(component.serverErrorMessage).toBe('There was a problem creating a Recaptcha token.');
  });

});

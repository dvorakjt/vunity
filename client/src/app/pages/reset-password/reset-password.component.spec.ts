import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { of, throwError } from 'rxjs';
import { ActivatedRouteStub } from 'src/app/tests/mocks/ActivatedRouteStub';
import { HttpClientStub } from 'src/app/tests/mocks/HttpClientStub';
import { RecaptchaV3ServiceStub } from 'src/app/tests/mocks/RecaptchaV3ServiceStub';

import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {provide: HttpClient, useClass: HttpClientStub},
        {provide: ActivatedRoute, useClass: ActivatedRouteStub},
        {provide: ReCaptchaV3Service, useClass: RecaptchaV3ServiceStub}
      ],
      imports: [FormsModule],
      declarations: [ ResetPasswordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set emailErrorMessage and fail to call recaptchaV3Service.execute if email is an empty string.', () => {
    spyOn(component.recaptchaV3Service, 'execute');
    component.email = '';
    component.passwordResetCode = '1234';
    component.passwordResetURI = 'uri';
    component.newPassword = 'newPassword';
    component.confirmPassword = 'newPassword';
    component.onSubmit();
    expect(component.emailErrorMessage).toBe('Please enter a valid email address.');
    expect(component.recaptchaV3Service.execute).not.toHaveBeenCalled();
  });

  it('should set emailErrorMessage and fail to call recaptchaV3Service.execute if email is invalid.', () => {
    spyOn(component.recaptchaV3Service, 'execute');
    component.email = 'not a valid email address.';
    component.passwordResetCode = '1234';
    component.passwordResetURI = 'uri';
    component.newPassword = 'newPassword';
    component.confirmPassword = 'newPassword';
    component.onSubmit();
    expect(component.emailErrorMessage).toBe('Please enter a valid email address.');
    expect(component.recaptchaV3Service.execute).not.toHaveBeenCalled();
  });

  it('should set passwordResetCodeErrorMessage and fail to call recaptchaV3Service.execute if passwordResetCode is an empty string.', () => {
    spyOn(component.recaptchaV3Service, 'execute');
    component.email = 'valid@example.com';
    component.passwordResetCode = '';
    component.passwordResetURI = 'uri';
    component.newPassword = 'newPassword';
    component.confirmPassword = 'newPassword';
    component.onSubmit();
    expect(component.passwordResetCodeErrorMessage).toBe('Please enter the temporary password that was sent to your email address.');
    expect(component.recaptchaV3Service.execute).not.toHaveBeenCalled();
  });

  it('should set confirmPasswordErrorMessage and fail to call recaptchaV3Service.execute if newPassword and confirmPassword are NOT empty strings BUT do not match.', () => {
    spyOn(component.recaptchaV3Service, 'execute');
    component.email = 'valid@example.com';
    component.passwordResetCode = '1234';
    component.passwordResetURI = 'uri';
    component.newPassword = 'newPassword';
    component.confirmPassword = 'new_password';
    component.onSubmit();
    expect(component.confirmPasswordErrorMessage).toBe('Please ensure that your new password and confirmed new password match.');
    expect(component.recaptchaV3Service.execute).not.toHaveBeenCalled();
  });

  it('should set newPasswordErrorMessage and fail to call recaptchaV3Service.execute if newPassword is an empty string.', () => {
    spyOn(component.recaptchaV3Service, 'execute');
    component.email = 'valid@example.com';
    component.passwordResetCode = '1234';
    component.passwordResetURI = 'uri';
    component.newPassword = '';
    component.confirmPassword = '';
    component.onSubmit();
    expect(component.newPasswordErrorMessage).toBe('Please enter a new password.');
    expect(component.recaptchaV3Service.execute).not.toHaveBeenCalled();
  });

  it('should set confirmPasswordErrorMessage and fail to call recaptchaV3Service.execute if confirmPassword is an empty string.', () => {
    spyOn(component.recaptchaV3Service, 'execute');
    component.email = 'valid@example.com';
    component.passwordResetCode = '1234';
    component.passwordResetURI = 'uri';
    component.newPassword = '';
    component.confirmPassword = '';
    component.onSubmit();
    expect(component.confirmPasswordErrorMessage).toBe('Please confirm your new password.');
    expect(component.recaptchaV3Service.execute).not.toHaveBeenCalled();
  });

  it('should set succeeded to true when both recaptchaV3Service.execute and http.post succeed.', () => {
    spyOn(component.recaptchaV3Service, 'execute').and.returnValue(of('token'));
    spyOn(component.http, 'post').and.returnValue(of({status: 200}));
    component.email = 'valid@example.com';
    component.passwordResetCode = '1234';
    component.passwordResetURI = 'uri';
    component.newPassword = 'newPassword';
    component.confirmPassword = 'newPassword';
    component.onSubmit();
    expect(component.recaptchaV3Service.execute).toHaveBeenCalled();
    expect(component.http.post).toHaveBeenCalledWith('/api/users/reset_password', {
      email: 'valid@example.com',
      passwordResetURI : 'uri',
      passwordResetCode : '1234',
      newPassword : 'newPassword',
      recaptchaToken : 'token'
    });
    expect(component.succeeded).toBeTrue();
  });

  it('should set serverErrorMessage when http.post fails.', () => {
    spyOn(component.recaptchaV3Service, 'execute').and.returnValue(of('token'));
    spyOn(component.http, 'post').and.returnValue(throwError(() => new Error()));
    component.email = 'notAUser@example.com';
    component.passwordResetCode = '1234';
    component.passwordResetURI = 'uri';
    component.newPassword = 'newPassword';
    component.confirmPassword = 'newPassword';
    component.onSubmit();
    expect(component.recaptchaV3Service.execute).toHaveBeenCalled();
    expect(component.http.post).toHaveBeenCalledWith('/api/users/reset_password', {
      email: 'notAUser@example.com',
      passwordResetURI : 'uri',
      passwordResetCode : '1234',
      newPassword : 'newPassword',
      recaptchaToken : 'token'
    });
    expect(component.serverErrorMessage).toBe("We're sorry. We were unable to reset your password. Please ensure you have entered the correct credentials.");
  });

  it('should set serverErrorMessage when recaptchaV3Service.execute fails.', () => {
    spyOn(component.recaptchaV3Service, 'execute').and.returnValue(throwError(() => new Error()));
    component.email = 'valid@example.com';
    component.passwordResetCode = '1234';
    component.passwordResetURI = 'uri';
    component.newPassword = 'newPassword';
    component.confirmPassword = 'newPassword';
    component.onSubmit();
    expect(component.serverErrorMessage).toBe('There was a problem with recaptcha. Please reload the page and try again.');
  });
});

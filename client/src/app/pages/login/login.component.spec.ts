import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AuthServiceStub } from 'src/app/tests/mocks/AuthServiceStub';
import { RecaptchaV3ServiceStub } from 'src/app/tests/mocks/RecaptchaV3ServiceStub';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [FormsModule],
      providers: [{provide: AuthService, useClass: AuthServiceStub}, {provide: ReCaptchaV3Service, useClass: RecaptchaV3ServiceStub}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fail to call recaptchaV3Service.execute and should set the email error message if the user has not entered their email.', () => {
    spyOn(component.recaptchaV3Service, 'execute');
    component.email = '';
    component.password = 'password';
    component.onLogin();
    expect(component.recaptchaV3Service.execute).not.toHaveBeenCalled();
    expect(component.emailErrorMessage).toBe('Please enter your email address.');
  });

  it('should fail to call recaptchaV3Service.execute and should set the email error message if the user has entered an invalid email.', () => {
    spyOn(component.recaptchaV3Service, 'execute');
    component.email = 'invalid email address';
    component.password = 'password';
    component.onLogin();
    expect(component.recaptchaV3Service.execute).not.toHaveBeenCalled();
    expect(component.emailErrorMessage).toBe('Please enter a valid email address.');
  });

  it('should fail to call recaptchaV3Service.execute and should set the password error message if no password is entered.', () => {
    spyOn(component.recaptchaV3Service, 'execute');
    component.email = 'valid@example.com';
    component.password = '';
    component.onLogin();
    expect(component.recaptchaV3Service.execute).not.toHaveBeenCalled();
    expect(component.passwordErrorMessage).toBe('Please enter your password.');
  });

  it('should fail to call authService.login if recaptchaV3Service fails to generate a token.', () => {
    spyOn(component.recaptchaV3Service, 'execute').and.returnValue(throwError(() => {
      return new Error('failed to create a token.');
    }));
    component.email = 'valid@example.com';
    component.password = '123';
    component.onLogin();
    expect(component.formSubmissionError).toBe('There was a problem with recaptcha. Please reload the page and try again.');
  });

  it('should call authService.login when recaptchaV3Service successfully creates a token.', () => {
    spyOn(component.recaptchaV3Service, 'execute').and.returnValue(of('recaptchaToken'));
    spyOn(component.authService, 'login');
    component.email = 'valid@example.com';
    component.password = '123';
    component.onLogin();
    expect(component.authService.login).toHaveBeenCalledWith('valid@example.com', '123', 'recaptchaToken');
  });

  it('should display authService.errorMessage', () => {
    component.authService.errorMessage = 'Error';
    fixture.detectChanges();
    const errorPTag = fixture.nativeElement.getElementsByClassName('formSubmissionError')[0];
    expect(errorPTag.textContent).toBe('Error');
  });
});

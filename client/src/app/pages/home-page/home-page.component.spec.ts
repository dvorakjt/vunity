import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { of, throwError } from 'rxjs';
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
      imports: [FormsModule],
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

  it('should set nameError and not call recaptchaV3Service if name is an empty string.', () => {
    spyOn(component.recaptchaV3Service, 'execute');
    component.name = '';
    component.onSubmit();
    expect(component.nameError).toBe('Please enter your name.');
    expect(component.recaptchaV3Service.execute).not.toHaveBeenCalled();
  });

  it('should set emailError and should not call recaptchaV3Service.execute when email is an empty string.', () => {
    spyOn(component.recaptchaV3Service, 'execute');
    component.email = '';
    component.onSubmit();
    expect(component.emailError).toBe('Please enter a valid email.');
    expect(component.recaptchaV3Service.execute).not.toHaveBeenCalled();
  });

  it('should set emailError and not call recaptchaV3Service.execute when email is invalid.', () => {
    spyOn(component.recaptchaV3Service, 'execute');
    component.email = 'not a valid email';
    component.onSubmit();
    expect(component.emailError).toBe('Please enter a valid email.');
    expect(component.recaptchaV3Service.execute).not.toHaveBeenCalled();
  });

  it('should set reasonForInterestError and not call recaptchaV3Service when reasonForInterest is an empty string.', () => {
    spyOn(component.recaptchaV3Service, 'execute');
    component.reasonForInterest = '';
    component.onSubmit();
    expect(component.reasonForInterestError).toBe('Please describe your reason for interest in the app.');
    expect(component.recaptchaV3Service.execute).not.toHaveBeenCalled();
  });

  it('should set formSubmissionSuccessModalTitle, formSubmissionSuccessModalText & showFormSubmissionSuccessModal when recaptchaV3Service.execute and http.post both succeed.', () => {
    spyOn(component.recaptchaV3Service, 'execute').and.returnValue(of('token'));
    spyOn(component.http, 'post').and.returnValue(of({status: 200}));
    component.name = 'Alice';
    component.email = 'valid@example.com';
    component.reasonForInterest = 'Wow! Such a cool app!';
    component.onSubmit();
    expect(component.formSubmissionSuccessModalTitle).toBe('Success!');
    expect(component.formSubmissionSuccessModalText).toBe("We have received your request for a demo and we'll be in touch shortly. Thank you for your interest in Vunity!");
    expect(component.showFormSubmissionSuccessModal).toBeTrue();
  });

  it('should set formSubmissionSuccessModalTitle, formSubmissionSuccessModalText & showFormSubmissionSuccessModal when recaptcha succeeds & http.post returns a 207 status code.', () => {
    spyOn(component.recaptchaV3Service, 'execute').and.returnValue(of('token'));
    spyOn(component.http, 'post').and.returnValue(of({status: 207, body: {unreachableEmailAddresses: ['invalid@notawebsite.com']}}));
    component.name = 'Alice';
    component.email = 'invalid@notawebsite.com';
    component.reasonForInterest = 'Wow! Such a cool app!';
    component.onSubmit();
    expect(component.formSubmissionSuccessModalTitle).toBe('We received your request, but...');
    expect(component.formSubmissionSuccessModalText).toBe("We could not reach the email address you entered (invalid@notawebsite.com). You may want to confirm that you entered your email address correctly and try again.");
    expect(component.showFormSubmissionSuccessModal).toBeTrue();
  });

  it('should set formSubmissionError when recaptcha succeeds but post request fails (for instance, if it fails to email the application owner).', () => {
    spyOn(component.recaptchaV3Service, 'execute').and.returnValue(of('token'));
    spyOn(component.http, 'post').and.returnValue(throwError(() => new Error()));
    component.name = 'Alice';
    component.email = 'valid@example.com';
    component.reasonForInterest = 'Wow! Such a cool app!';
    component.onSubmit();
    expect(component.formSubmissionError).toBe('There was a problem submitting your request. Please refresh the page and try again.');
  });

  it('should set formSubmissionError when recaptchaV3Service.execute fails.', () => {
    spyOn(component.recaptchaV3Service, 'execute').and.returnValue(throwError(() => new Error()));
    component.name = 'Alice';
    component.email = 'valid@example.com';
    component.reasonForInterest = 'Wow! Such a cool app!';
    component.onSubmit();
    expect(component.formSubmissionError).toBe('There was a problem with recaptcha. Please reload the page and try again.');
  });

  it('should render the form submission success modal if showFormSubmissionSuccessModal is true.', () => {
    component.showFormSubmissionSuccessModal = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.getElementsByClassName('modalContainer').length).toBe(1);
    expect(fixture.nativeElement.getElementsByClassName('modal').length).toBe(1);
  });

  it('should not render the form submission success modal if showFormSubmissionSuccessModal is false.', () => {
    component.showFormSubmissionSuccessModal = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.getElementsByClassName('modalContainer').length).toBe(0);
    expect(fixture.nativeElement.getElementsByClassName('modal').length).toBe(0);
  });
});

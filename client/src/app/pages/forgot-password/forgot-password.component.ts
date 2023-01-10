import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { hideRecaptcha, showRecaptcha } from 'src/app/utils/recaptcha.util';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements AfterViewInit, OnDestroy{
  public email = '';
  public isLoading = false;
  public succeeded = false;
  public emailErrorMessage = '';
  public serverErrorMessage = '';

  constructor(public http:HttpClient, public recaptchaV3Service:ReCaptchaV3Service, public loadingService:LoadingService) {}

  ngAfterViewInit(): void {
    showRecaptcha();
  }

  ngOnDestroy(): void {
    hideRecaptcha();
  }

  onRequestPasswordReset() {

    this.serverErrorMessage = '';

    if(!this.email || !this.email.match(
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    )) {
      this.emailErrorMessage = 'Please enter a valid email address.';
      return;
    }

    this.loadingService.isLoading = true;

    this.recaptchaV3Service.execute('passwordResetRequest').subscribe({
      next: (recaptchaToken) => {
        this.http.post('/api/users/request_password_reset?email=' + this.email + "&recaptchaToken=" + recaptchaToken, {}, {observe: 'response'}).subscribe({
          next: () => {
            this.loadingService.isLoading = false;
            this.succeeded = true;
          },
          error: (responseData) => {
            this.loadingService.isLoading = false;
            if(responseData.status == 500) {
              this.serverErrorMessage = "We're sorry. We found your account but could not reach the email address you provided in order to send you a password reset link.";
            } else this.serverErrorMessage = "We're sorry, we couldn't send you a reset code. Please ensure that your email address is entered correctly.";
          }
        })
      },
      error: (_error) => {
        this.loadingService.isLoading = false;
        this.serverErrorMessage = 'There was a problem creating a Recaptcha token.';
      }
    });
  }
}

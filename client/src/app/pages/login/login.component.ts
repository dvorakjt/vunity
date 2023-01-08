import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { showRecaptcha, hideRecaptcha } from 'src/app/utils/recaptcha.util';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  email = '';
  password = '';
  emailErrorMessage = '';
  passwordErrorMessage = '';
  formSubmissionError = '';

  constructor(public authService:AuthService, public recaptchaV3Service:ReCaptchaV3Service) { }
  ngAfterViewInit(): void {
    showRecaptcha();
  }
  ngOnDestroy(): void {
    hideRecaptcha();
  }

  onLogin() {
    let failed = false;
    if(!this.email) {
      this.emailErrorMessage = 'Please enter your email address.';
      failed = true;
    }
    if(this.email && !this.email.match(
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    )) {
      this.emailErrorMessage = 'Please enter a valid email address.';
      failed = true;
    }
    if(!this.password) {
      this.passwordErrorMessage = 'Please enter your password.';
      failed = true;
    }
    if(failed) return;
    this.recaptchaV3Service.execute('login')
      .subscribe({
        next: (recaptchaToken) => {
          this.authService.login(this.email, this.password, recaptchaToken);
        }, 
        error: (error) => {
          this.formSubmissionError = 'There was a problem with recaptcha. Please reload the page and try again.'
        }
      });
  }
}

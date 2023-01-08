import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { showRecaptcha, hideRecaptcha } from 'src/app/utils/recaptcha.util';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements AfterViewInit, OnDestroy {

  constructor(private loadingService:LoadingService, private recaptchaV3Service:ReCaptchaV3Service, private http:HttpClient) {}

  ngAfterViewInit(): void {
    showRecaptcha();
  }

  ngOnDestroy(): void {
    hideRecaptcha();
  }

  name = '';
  email = '';
  reasonForInterest = '';
  nameError = '';
  emailError = '';
  reasonForInterestError = '';
  formSubmissionError = '';
  showFormSubmissionSuccessModal = false;

  onSubmit() {
    let valid = true;
    if(!this.name) {
      valid = false;
      this.nameError = 'Please enter your name.';
    }
    if(!this.email || !this.email.match(
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    )) {
      valid = false;
      this.emailError = 'Please enter a valid email.';
    }
    if(!this.reasonForInterest) {
      valid = false;
      this.reasonForInterestError = 'Please describe your reason for interest in the app.';
    }
    if(!valid) return;

    this.loadingService.isLoading = true;

    this.recaptchaV3Service.execute('requestDemo')
      .subscribe({
        next: (recaptchaToken) => {
          this.http.post('/api/request_demo', {
            name: this.name,
            email : this.email,
            reasonForInterest : this.reasonForInterest,
            recaptchaToken
          }).subscribe({
            next: () => {
              this.loadingService.isLoading = false;
              this.showFormSubmissionSuccessModal = true;
            },
            error: () => {
              this.loadingService.isLoading = false;
              this.formSubmissionError = 'There was a problem submitting your request. Please refresh the page and try again.'
            }
          })
        }, 
        error: (error) => {
          this.formSubmissionError = 'There was a problem with recaptcha. Please reload the page and try again.'
        }
      });
  }

}

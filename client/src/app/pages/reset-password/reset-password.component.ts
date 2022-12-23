import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  isLoading = false;
  succeeded = false;

  email = '';
  passwordResetCode = '';
  passwordResetURI:any;
  newPassword = '';
  confirmPassword = '';

  emailErrorMessage = '';
  passwordResetCodeErrorMessage = '';
  newPasswordErrorMessage = '';
  confirmPasswordErrorMessage = '';
  serverErrorMessage = '';

  constructor(private http:HttpClient, private route:ActivatedRoute) {
    this.passwordResetURI = this.route.snapshot.paramMap.get('passwordResetURI');
    console.log(this.passwordResetURI);
  }

  onSubmit() {
    let failedFrontEndValidation = false;

    if(!this.email.length || !this.email.match(
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    )) {
      this.emailErrorMessage = 'Please enter a valid email address.';
      failedFrontEndValidation = true;
    }
    if(!this.passwordResetCode.length) {
      this.passwordResetCodeErrorMessage = 'Please enter the temporary password that was sent to your email address.';
      failedFrontEndValidation = true;
    }
    if(this.newPassword != this.confirmPassword) {
      this.confirmPasswordErrorMessage = 'Please ensure that your new password and confirmed new password match.';
      failedFrontEndValidation = true;
    }
    if(!this.newPassword.length) {
      this.newPasswordErrorMessage = 'Please enter a new password.';
      failedFrontEndValidation = true;
    }
    if(!this.confirmPassword.length) {
      this.confirmPasswordErrorMessage = 'Please confirm your new password.';
    }
    if(failedFrontEndValidation) return;

    this.http.post('/api/users/reset_password', {
      email: this.email,
      passwordResetURI : this.passwordResetURI,
      passwordResetCode : this.passwordResetCode,
      newPassword : this.newPassword
    }).subscribe({
      next: () => {
        this.succeeded = true;
        this.isLoading = false;
      },
      error: () => {
        this.serverErrorMessage = "We're sorry. We were unable to reset your password. Please ensure you have entered the correct credentials.";
        this.isLoading = false;
      }
    })
  }
}

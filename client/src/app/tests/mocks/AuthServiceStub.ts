import { User } from 'src/app/models/user.model';
import { ReplaySubject } from 'rxjs';

export class AuthServiceStub {
    isLoading = false;
    access_token = "";
    refresh_token = "";
    activeUser? : User;
    errorMessage = "";

    isAuthenticated = new ReplaySubject<boolean>(1);

    login(email:string, password:string, recaptchaToken:string) {
    }

    getAuthorizationHeader() {
    }

    logout() {
    }
}
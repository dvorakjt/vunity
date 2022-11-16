import {Injectable, OnInit} from '@angular/core';
import { User } from 'src/app/models/user.model';

@Injectable({providedIn: 'root'})
export class AuthService {
    isLoading = true;
    isAuthorized = false;
    //activeUser : User

    checkForStoredToken() {
        const storedToken = localStorage.getItem('jwt');
        const refreshToken = localStorage.getItem('refresh_token');
        if(!storedToken || !refreshToken) {
            localStorage.setItem('jwt', 'json web token');
            localStorage.setItem('refresh_token', 'refresh token');
            this.isLoading = false;
            return;
        } else {
            setTimeout(() => {
                console.log(storedToken);
                this.isAuthorized = true;
                this.isLoading = false;
            }, 1000);
        }
    }

    constructor() {
        this.checkForStoredToken();
    }
}
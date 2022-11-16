import {Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { User } from 'src/app/models/user.model';

@Injectable({providedIn: 'root'})
export class AuthService {
    isLoading = false;
    access_token = "";
    refresh_token = "";
    activeUser? : User;
    errorMessage = "";

    constructor(private http : HttpClient) {
        this.checkForStoredToken();
    }

    checkForStoredToken() {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        if(!accessToken || !refreshToken) {
            return;
        } else {
            this.isLoading = true;
            this.access_token = accessToken;
            this.refresh_token = refreshToken;
            this.getUserInfo();
        }
    }

    login(email:string, password:string) {
        this.errorMessage = "";
        this.isLoading = true;
        this.http.post(`/api/users/login?email=${email}&password=${password}`, {}).subscribe(
            {
              next: (responseData:any) => {
                localStorage.setItem("access_token", responseData.access_token);
                localStorage.setItem("refresh_token", responseData.refresh_token);
                this.access_token = responseData.access_token;
                this.refresh_token = responseData.refresh_token;
                this.getUserInfo();
              },
              error: error => {
                this.errorMessage = error.message;
                this.isLoading = false;
              },
            }
        );
    }

    getUserInfo() {
        const headers = new HttpHeaders({
            'Authorization' : this.getAuthorizationHeader()
        });
        const opts = {headers: headers};
        this.http.get('/api/users/userinfo', opts).subscribe({
            next: (responseData:any) => {
                this.activeUser = new User(responseData.name, responseData.email);
                this.isLoading = false;
                console.log(this.activeUser);
            },
            error: error => {

                //here is where to try the refresh token...?

                this.clearUserData();
                this.isLoading = false;
                console.log(error.message);
            }
        });
    }

    getAuthorizationHeader() {
        return "Bearer " + this.access_token;
    }

    //this will be used to request a new access token
    refreshAccessToken() {
        return;
    }

    logout() {
        this.clearUserData();
    }

    clearUserData() {
        localStorage.clear();
        this.access_token = "";
        this.refresh_token = "";
        this.activeUser = undefined;
    }
}
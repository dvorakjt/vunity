import {Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { User } from 'src/app/models/user.model';
import { Router } from '@angular/router';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthService {
    isLoading = false;
    access_token = "";
    refresh_token = "";
    activeUser? : User;
    errorMessage = "";

    isAuthenticated = new ReplaySubject<boolean>(1);

    constructor(private http : HttpClient, private router:Router) {

        this.checkForStoredToken().subscribe({
            next: (authSucceeded) => {
                if(authSucceeded) this.isAuthenticated.next(true);
                else this.isAuthenticated.next(false);
            }
        });
    }

    checkForStoredToken() {
        return new Observable<boolean>(subscriber => {
            if(this.activeUser) {
                subscriber.next(true);
                subscriber.complete();
            } else {
                const accessToken = localStorage.getItem('access_token');
                const refreshToken = localStorage.getItem('refresh_token');
                if(!accessToken || !refreshToken) {
                    subscriber.next(false);
                    subscriber.complete();
                } else {
                    this.isLoading = true;
                    this.access_token = accessToken;
                    this.refresh_token = refreshToken;
                    this.getUserInfo().subscribe({
                        next: (userData) => {
                            this.activeUser = new User(userData.name, userData.email);
                            this.isLoading = false;
                            subscriber.next(true);
                        },
                        error: (_err) => {
                            subscriber.next(false);
                            this.isLoading = false;
                        }
                    });
                }
            }
        });
    }

    login(email:string, password:string, recaptchaToken:string) {
        this.errorMessage = "";
        this.isLoading = true;
        this.http.post(`/api/users/login?email=${email}&password=${password}&recaptchaToken=${recaptchaToken}`, {}).subscribe(
            {
              next: (responseData:any) => {
                localStorage.setItem("access_token", responseData.access_token);
                localStorage.setItem("refresh_token", responseData.refresh_token);
                this.access_token = responseData.access_token;
                this.refresh_token = responseData.refresh_token;
                this.getUserInfo().subscribe({
                    next: (userData) => {
                        this.activeUser = new User(userData.name, userData.email);
                        this.isAuthenticated.next(true);
                        this.router.navigate(['/dashboard']);
                        this.isLoading = false;
                    },
                    error: (error) => {
                        this.errorMessage = error.message;
                        this.isLoading = false;
                        this.isAuthenticated.next(false);
                    }
                })
              },
              error: error => {
                this.errorMessage = error.message;
                this.isLoading = false;
              },
            }
        );
    }

    getUserInfo() {
        return new Observable<any>((subscriber) => {
            const headers = new HttpHeaders({
                'Authorization' : this.getAuthorizationHeader()
            });
            const opts = {headers: headers};
            this.http.get('/api/users/userinfo', opts).subscribe({
                next: (responseData:any) => {
                    subscriber.next(responseData);
                    subscriber.complete();
                },
                error: (_err) => {
                    this.retryGetUserInfo().subscribe({
                        next: (responseData) => {
                            subscriber.next(responseData);
                            subscriber.complete();
                        },
                        error: (error) => subscriber.error(error)
                    });
                }
            });
        });
    }

    getAuthorizationHeader() {
        return "Bearer " + this.access_token;
    }

    retryGetUserInfo() {
        console.log("Access token expired. trying refresh token.");
        return new Observable<any>((subscriber) => {
            this.refreshAccessToken().subscribe({
                next: () => {
                    const headers = new HttpHeaders({
                        'Authorization' : this.getAuthorizationHeader()
                    });
                    const opts = {headers: headers};
                    this.http.get('/api/users/userinfo', opts).subscribe({
                        next: (responseData:any) => {
                            subscriber.next(responseData);
                            subscriber.complete();
                        },
                        error: (error) => {
                            subscriber.error(error);
                        }
                    });
                },
                error: (error:Error) => subscriber.error(error)
            })
        });
    }

    //this will be used to request a new access token
    refreshAccessToken() {
        return new Observable<any>((subscriber) => {
            if(!this.refresh_token) {
                subscriber.error(new Error("No refresh token found."));
            }
            const headers = new HttpHeaders({
                'Authorization' : 'Bearer ' + this.refresh_token
            });
            const opts = {headers: headers};
            this.http.get(`/api/token/refresh`, opts).subscribe({
                next: (responseData:any) => {
                    localStorage.setItem("access_token", responseData.access_token);
                    this.access_token = responseData.access_token;
                    subscriber.next();
                    subscriber.complete();
                },
                error: (error) => {
                    subscriber.error(error);
                }
            });
        });
    }

    logout() {
        this.clearUserData();
        this.isAuthenticated.next(false);
        this.router.navigate(["/login"]);
    }

    clearUserData() {
        localStorage.clear();
        this.access_token = "";
        this.refresh_token = "";
        this.activeUser = undefined;
    }
}
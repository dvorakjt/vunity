import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
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

        this.http.get("/api/csrf_token").subscribe(() => {
            this.checkForExistingSession().subscribe({
                next: (authSucceeded) => {
                    if(authSucceeded) this.isAuthenticated.next(true);
                    else this.isAuthenticated.next(false);
                }
            });
        });
        
    }

    checkForExistingSession() {
        return new Observable<boolean>(subscriber => {
            if(this.activeUser) {
                subscriber.next(true);
                subscriber.complete();
            } else {
                this.isLoading = true;
                this.getUserInfo().subscribe({
                    next: (userData) => {
                        this.activeUser = new User(userData.name, userData.email);
                        this.isLoading = false;
                        subscriber.next(true);
                    },
                    error: (err) => {
                        subscriber.next(false);
                        this.isLoading = false;
                    }
                });    
            }
        });
    }

    login(email:string, password:string, recaptchaToken:string) {
        this.errorMessage = "";
        this.isLoading = true;
        this.http.post(`/api/users/login`, {
            email,
            password,
            recaptchaToken
        }).subscribe(
            {
              next: () => {
                this.getUserInfo().subscribe({
                    next: (userData) => {
                        this.activeUser = new User(userData.name, userData.email);
                        this.isAuthenticated.next(true);
                        this.router.navigate(['/dashboard']);
                        this.isLoading = false;
                    },
                    error: (_error) => {
                        this.errorMessage = "Failed to login. Please ensure your credentials are correct.";
                        this.isLoading = false;
                        this.isAuthenticated.next(false);
                    }
                })
              },
              error: (_error) => {
                this.errorMessage = "Failed to login. Please ensure your credentials are correct.";
                this.isLoading = false;
              },
            }
        );
    }

    getUserInfo() {
        return new Observable<any>((subscriber) => {
            this.http.post('/api/users/userinfo', {}).subscribe({
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

    retryGetUserInfo() {
        return new Observable<any>((subscriber) => {
            this.refreshAccessToken().subscribe({
                next: () => {
                    this.http.post('/api/users/userinfo', {}).subscribe({
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

    refreshAccessToken() {
        return new Observable<any>((subscriber) => {
            this.http.post(`/api/with_rt/refresh`, {}).subscribe({
                next: () => {
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
        //should make a call to the backend to logout and cause the current cookies to expire.
        return new Observable<any>((subscriber) => {
            this.http.post('/api/users/logout', {}).subscribe({
                next: () => {
                    subscriber.next();
                    subscriber.complete();
                    this.clearUserData();
                    this.isAuthenticated.next(false);
                    location.reload();
                    
                },
                error: (error) => {
                    subscriber.error(error);
                    subscriber.complete();
                }
            });
        });
    }

    clearUserData() {
        this.activeUser = undefined;
    }
}
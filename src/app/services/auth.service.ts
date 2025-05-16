import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseURL = process.env['API_URL'] || 'http://localhost:3000';
  http = inject(HttpClient);
  router = inject(Router);
  login() {}
  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if(!refreshToken) {
      this.logOut();
      return throwError(() => new Error('No refresh token found'));
    }
    return this.http.post<{token: string}>(`${this.baseURL}/auth/refresh`, {refreshToken})
      .pipe(
        map((res) => res.token),
        tap((newAccessToken: string) => {
          localStorage.setItem('token', newAccessToken);
        }),
        catchError((error) => {
          this.logOut();
          return throwError(() => error);
        })
      )
  }
  logOut() {
    localStorage.clear()
    this.router.navigate(['/login']);
  }
  constructor() { }
}

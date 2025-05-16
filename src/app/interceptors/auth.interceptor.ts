import { isPlatformServer } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);
  if (isPlatformServer(platformId)) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  let headers = req.headers.set('Content-Type', 'application/json');
  if (token !== null) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
  const authReq = req.clone({ headers, withCredentials: true });
  // usuario pide algo con un token 
  // server responde con un 403 por el token caducado
  // interceptor lo atrapa y hace un nuevo request con el token renovado
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        return authService.refreshToken().pipe(
          switchMap(newToken => {
            localStorage.setItem('token', newToken);
            const updateHeaders = req.headers.set('Authorization', `Bearer ${newToken}`);
            const newReq = req.clone({ headers: updateHeaders });
            return next(newReq);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

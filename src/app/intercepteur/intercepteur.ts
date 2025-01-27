import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const userConnect = JSON.parse(localStorage.getItem("userConnect") || "");

    // Assurez-vous que userConnect et userConnect.authorization sont définis
    if ( userConnect && userConnect.authorization && userConnect.authorization.token) {
      const token = userConnect.authorization.token;
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request);
  }
}

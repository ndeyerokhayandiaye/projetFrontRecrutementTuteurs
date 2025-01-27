import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { baseUrl } from './url';
// import { HttpClientModule } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${baseUrl}/users`, userData,{ responseType: 'text' as 'json' }, )
  }


  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${baseUrl}/auth/login`, credentials);
  }



  // login(credentials: any): Observable<LoginResponse> {
  //   return this.http.post<LoginResponse>(`${baseUrl}/auth/login`, credentials);
  // }
}

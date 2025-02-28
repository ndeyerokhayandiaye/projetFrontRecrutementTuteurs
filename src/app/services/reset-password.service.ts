import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { baseUrl } from './url';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {
  private apiUrl = `${baseUrl}/password-reset`;

  constructor(private http: HttpClient) { }

  /**
   * Request a password reset OTP
   * @param data Object containing email
   */
  requestPasswordReset(data: { email: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/request`, data);
  }

  /**
   * Confirm password reset with OTP and new password
   * @param data Object containing email, OTP code, and new password
   */
  confirmPasswordReset(data: { email: string, otpCode: string, newPassword: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/confirm`, data);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { baseUrl } from './url';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private profileUpdated = new Subject<void>();

  profileUpdated$ = this.profileUpdated.asObservable();

  constructor(private http: HttpClient, private loginService: LoginService) { }

  notifyProfileUpdate() {
    this.profileUpdated.next();
  }

  private getAuthHeaders() {
    return this.loginService.getAuthorizationHeaders();
  }

  // Récupérer le profil de l'utilisateur connecté
  getUserProfile(): Observable<any> {
    const userConnect = JSON.parse(localStorage.getItem('userConnect') || '{}');
    const email = userConnect.email;
    return this.http.get<any>(`${baseUrl}/users/${email}`, { headers: this.getAuthHeaders() });
  }

  // Mettre à jour les informations du profil
  updateUserProfile(userData: any): Observable<any> {
    const userConnect = JSON.parse(localStorage.getItem('userConnect') || '{}');
    const email = userConnect.email;
    return this.http.put<any>(`${baseUrl}/users/${email}`, userData, { headers: this.getAuthHeaders() });
  }

  // Récupérer les candidatures de l'utilisateur
  getUserApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/applications/user`, { headers: this.getAuthHeaders() });
  }

  // Récupérer les détails d'une annonce
  getAnnouncementDetails(announcementId: string): Observable<any> {
    return this.http.get<any>(`${baseUrl}/job-announcements/${announcementId}`, { headers: this.getAuthHeaders() });
  }

  // Annuler une candidature
  cancelApplication(applicationId: string): Observable<any> {
    return this.http.delete<any>(`${baseUrl}/applications/${applicationId}/cancel`, { headers: this.getAuthHeaders() });
  }
}
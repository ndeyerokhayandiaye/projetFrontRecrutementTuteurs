import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { baseUrl } from './url';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private loginService: LoginService) { }

  private getAuthHeaders(): HttpHeaders {
    return this.loginService.getAuthorizationHeaders();
  }

  // Créer un nouvel administrateur
  createAdmin(adminData: any): Observable<any> {
    // Assurez-vous que le rôle est défini comme ADMIN
    adminData.role = 'ADMIN';
    return this.http.post<any>(`${baseUrl}/users`, adminData, { 
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json'  // Accepter une réponse textuelle
    });
  }

  // Récupérer tous les administrateurs
  getAllAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/users/admins`, { headers: this.getAuthHeaders() });
  }

  // Récupérer tous les candidats
  getAllCandidates(): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/users/candidates`, { headers: this.getAuthHeaders() });
  }

  // Récupérer un utilisateur par email
  getUserByEmail(email: string): Observable<any> {
    return this.http.get<any>(`${baseUrl}/users/${email}`, { headers: this.getAuthHeaders() });
  }

  // Mettre à jour un utilisateur
  updateUser(email: string, userData: any): Observable<any> {
    return this.http.put<any>(`${baseUrl}/users/${email}`, userData, { headers: this.getAuthHeaders() });
  }

  // Supprimer un utilisateur
  deleteUser(email: string): Observable<any> {
    return this.http.delete<any>(`${baseUrl}/users/${email}`, { headers: this.getAuthHeaders() });
  }
}
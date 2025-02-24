import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { baseUrl } from './url';
// import { HttpClientModule } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) {}


  // Fonction pour récupérer le token depuis le stockage local
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Si tu stockes le token ici
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  public getAuthorizationHeaders(): HttpHeaders {
    return this.getAuthHeaders();
  }


  register(userData: any): Observable<any> {
    return this.http.post<any>(`${baseUrl}/users`, userData,{ responseType: 'text' as 'json' }, )
  }


  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${baseUrl}/auth/login`, credentials);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token'); // Vérifie si le token est stocké
  }

    // Récupérer les informations d'un utilisateur par son email
    getUserByEmail(email: string): Observable<any> {
      return this.http.get<any>(`${baseUrl}/users/${email}`);
    }



    // Mettre à jour le profil utilisateur
    updateUser(email: string, userData: any): Observable<any> {
      return this.http.put<any>(`${baseUrl}/users/${email}`, userData);
    }

  //Récupérer tous les utilisateurs avec le token
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/users/all`, {
      headers: this.getAuthHeaders()
    });
  }

   //Supprimer un utilisateur
   deleteUser(email: string): Observable<any> {
    return this.http.delete<any>(`${baseUrl}/users/${email}`, {
      headers: this.getAuthHeaders()
    });
  }

}

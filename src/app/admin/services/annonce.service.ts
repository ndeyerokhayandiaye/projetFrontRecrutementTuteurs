import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { baseUrl } from '../../services/url';
import { AuthInterceptor } from '../../intercepteur/intercepteur';

@Injectable({
  providedIn: 'root'
})
export class AnnonceService {

  constructor(private http: HttpClient) {}

 // Méthode pour récupérer le token et l'ajouter aux requêtes HTTP
//  private getAuthHeaders(): HttpHeaders {
//   const token = localStorage.getItem('token'); // Récupération du token depuis le localStorage
//   return new HttpHeaders({
//     'Authorization': `Bearer ${token}`, // Ajout du token dans l'en-tête
//     'Content-Type': 'application/json'
//   });
// }

private getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('token'); // Récupération du token depuis le localStorage
  console.log('Token JWT:', token); // Vérifie si le token est récupéré correctement
  return new HttpHeaders({
    'Authorization': `Bearer ${token}`, // Ajout du token dans l'en-tête
    'Content-Type': 'application/json'
  });
}


// Ajouter une annonce
addAnnonce(annonceData: any): Observable<any> {
  return this.http.post<any>(`${baseUrl}/job-announcements`, annonceData, { headers: this.getAuthHeaders() });
}

// Récupérer toutes les annonces
getAnnonces(): Observable<any[]> {
  return this.http.get<any[]>(`${baseUrl}/job-announcements`, { headers: this.getAuthHeaders() });
}

// Récupérer une annonce par ID
getAnnonceById(id: number): Observable<any> {
  return this.http.get<any>(`${baseUrl}/job-announcements/${id}`, { headers: this.getAuthHeaders() });
}

// Mettre à jour une annonce
updateAnnonce(id: number, annonceData: any): Observable<any> {
  return this.http.put<any>(`${baseUrl}/job-announcements/${id}`, annonceData, { headers: this.getAuthHeaders() });
}

// Supprimer une annonce
deleteAnnonce(id: number): Observable<any> {
  return this.http.delete<any>(`${baseUrl}/job-announcements/${id}`, { headers: this.getAuthHeaders() });
}
}

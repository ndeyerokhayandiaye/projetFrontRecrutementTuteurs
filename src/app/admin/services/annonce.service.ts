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

// private getAuthHeaders(): HttpHeaders {
//   const token = localStorage.getItem('token'); // Récupération du token depuis le localStorage
//   console.log('Token JWT:', token); // Vérifie si le token est récupéré correctement
//   return new HttpHeaders({
//     'Authorization': `Bearer ${token}`, // Ajout du token dans l'en-tête
//     'Content-Type': 'application/json'
//   });
// }




private getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Aucun token trouvé !');
    return new HttpHeaders(); // Retourne un en-tête vide pour éviter les erreurs
  }
  return new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
}




// Ajouter une annonce
addAnnonce(annonce: any): Observable<any> {
  return this.http.post<any>(`${baseUrl}/job-announcements`, annonce, { headers: this.getAuthHeaders() });
}


getAnnonces(): Observable<any[]> {
  return this.http.get<any[]>(`${baseUrl}/job-announcements`, { headers: this.getAuthHeaders() });
}

updateAnnonce(id: number, annonce: any): Observable<any> {
  return this.http.put<any>(`${baseUrl}/job-announcements/${id}`, annonce, { headers: this.getAuthHeaders() });
}

deleteAnnonce(id: number): Observable<any> {
  return this.http.delete<any>(`${baseUrl}/job-announcements/${id}`, { headers: this.getAuthHeaders() });
}







  // Ajouter une année académique
  addAcademicYear(formData: any): Observable<any> {
    return this.http.post<any>(`${baseUrl}/academic-years`,formData);
  }
  // Récupérer toutes les années académiques
  getAllAcademicYears(): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/academic-years`, { headers: this.getAuthHeaders() });
  }

  // Récupérer une année académique par ID
  getAcademicYearById(id: string): Observable<any> {
    return this.http.get<any>(`${baseUrl}/academic-years/${id}`, { headers: this.getAuthHeaders() });
  }

  // Mettre à jour une année académique
  updateAcademicYear(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${baseUrl}/academic-years/${id}`, data, { headers: this.getAuthHeaders() });
  }

  // Supprimer une année académique
  deleteAcademicYear(id: string): Observable<any> {
    return this.http.delete<any>(`${baseUrl}/academic-years/${id}`, { headers: this.getAuthHeaders() });
  }
}

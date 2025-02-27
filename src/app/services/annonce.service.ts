import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { baseUrl } from './url';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class AnnonceService {

  constructor(private http: HttpClient, private loginService: LoginService) { }


  private getAuthHeaders(): HttpHeaders {
    return this.loginService.getAuthorizationHeaders(); // Utilisation de la méthode publique
  }

  // Ajouter une annonce
  addAnnonce(annonce: any): Observable<any> {
    return this.http.post<any>(`${baseUrl}/job-announcements`, annonce, { headers: this.getAuthHeaders() });
  }

  getAnnonces(): Observable<any[]> {
    const token = localStorage.getItem('token');

    // Si le token existe on l'ajoute dans les headers sinon on fait une requête sans token
    const headers = token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' })
      : undefined;

    return this.http.get<any[]>(`${baseUrl}/job-announcements`, { headers });
  }

  // Récupérer les candidatures pour une annonce spécifique
  getApplicationsByAnnouncement(announcementId: string): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/applications/announcement/${announcementId}`,
      { headers: this.getAuthHeaders() });
  }
  
  // Récupérer les détails d'une annonce
  getAnnouncementDetails(announcementId: string): Observable<any> {
    return this.http.get<any>(`${baseUrl}/job-announcements/${announcementId}`, 
      { headers: this.getAuthHeaders() });
  }
  updateAnnonce(id: number, annonce: any): Observable<any> {
    return this.http.put<any>(`${baseUrl}/job-announcements/${id}`, annonce, { headers: this.getAuthHeaders() });
  }

  updateApplicationStatus(applicationId: string, status: string, comments?: string): Observable<any> {
    const payload = { 
      status, 
      ...(comments && { comments }) // Utiliser comments au lieu de rejectionReason
    };
    return this.http.patch<any>(`${baseUrl}/applications/${applicationId}/status`, payload, { headers: this.getAuthHeaders() });
  }
  

  deleteAnnonce(id: number): Observable<any> {
    return this.http.delete<any>(`${baseUrl}/job-announcements/${id}`, { headers: this.getAuthHeaders() });
  }


  postuler(payload: any): Observable<any> {
    console.log('Données envoyées:', payload); // Vérifier ce qui est envoyé
    return this.http.post<any>(`${baseUrl}/applications/with-documents`, payload, { headers: this.getAuthHeaders() });
  }

  // partie service année académique
  // Ajouter une année académique
  addAcademicYear(formData: any): Observable<any> {
    return this.http.post<any>(`${baseUrl}/academic-years`, formData);
  }
  //lister
  getAllAcademicYears(): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/academic-years`, { headers: this.getAuthHeaders() });
  }
  // Récupérer une année académique par ID
  getAcademicYearById(id: string): Observable<any> {
    return this.http.get<any>(`${baseUrl}/academic-years/${id}`, { headers: this.getAuthHeaders() });
  }

  updateAcademicYear(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${baseUrl}/academic-years/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteAcademicYear(id: string): Observable<any> {
    return this.http.delete<any>(`${baseUrl}/academic-years/${id}`, { headers: this.getAuthHeaders() });
  }
}

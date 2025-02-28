import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../services/login.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HttpClientModule } from '@angular/common/http';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute } from '@angular/router';
import { AnnonceService } from '../../../services/annonce.service';
import * as bootstrap from 'bootstrap';
import Swal from 'sweetalert2';
import { baseUrl } from '../../../services/url';

// Interfaces pour typer nos données
interface Document {
  id: string;
  fileName: string;
  filePath: string;
  documentType: string;
  status: string;
  uploadDate: string;
}

interface Candidate {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface Application {
  id: string;
  candidateId: string;
  announcementId: string;
  academicYearId: string;
  applicationType: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  documents: Document[];
  candidate?: Candidate;
}

@Component({
  selector: 'app-candidats-list',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterModule, MatPaginatorModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    RouterModule,
    MatSelectModule,
    MatOptionModule,
    HttpClientModule,
  ],
  templateUrl: './candidats-list.component.html',
  styleUrl: './candidats-list.component.scss'
})
export class CandidatsListComponent implements OnInit {
  users: any[] = [];
  applications: Application[] = [];
  searchQuery: string = '';
  loading = false;
  dataSource: Application[] = [];
  announcementId: string | null = null;
  selectedApplication: Application | null = null;
  announcementTitle: string = '';

  // Mappages pour les libellés
  applicationStatusMap: Record<string, string> = {
    'PENDING': 'En attente',
    'UNDER_REVIEW': 'En cours d\'examen',
    'ACCEPTED': 'Acceptée',
    'REJECTED': 'Rejetée',
    'CANCELLED': 'Annulée'
  };

  applicationTypeMap: Record<string, string> = {
    'NEW': 'Nouvelle',
    'RENEWAL': 'Renouvellement'
  };

  documentTypeMap: Record<string, string> = {
    'DIPLOMA': 'Diplôme',
    'MOTIVATION_LETTER': 'Lettre de motivation',
    'CV': 'CV',
    'IDENTITY_DOCUMENT': 'Pièce d\'identité',
    'OTHER': 'Autre document'
  };

  constructor(
    private loginService: LoginService,
    private annonceService: AnnonceService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Récupérer l'ID de l'annonce depuis les paramètres de la requête
    this.route.queryParams.subscribe(params => {
      this.announcementId = params['announcementId'];
      if (this.announcementId) {
        this.loadApplicationsByAnnouncement(this.announcementId);
        this.loadAnnouncementTitle(this.announcementId);
      } else {
        this.getUsers();
      }
    });
  }

  loadAnnouncementTitle(announcementId: string) {
    this.annonceService.getAnnouncementDetails(announcementId).subscribe(
      (data) => {
        this.announcementTitle = data.title;
      },
      (error) => {
        console.error('Erreur lors de la récupération du titre de l\'annonce', error);
        this.announcementTitle = `Annonce #${announcementId.substring(0, 8)}`;
      }
    );
  }

  loadApplicationsByAnnouncement(announcementId: string) {
    this.loading = true;
    this.annonceService.getApplicationsByAnnouncement(announcementId).subscribe(
      (data: Application[]) => {
        this.applications = data;
        this.dataSource = data; // Pour la recherche
        this.loading = false;
      },
      (error) => {
        console.error('Erreur lors de la récupération des candidatures', error);
        this.loading = false;
      }
    );
  }

  viewApplicationDetails(application: Application) {
    this.selectedApplication = application;
    // Utiliser setTimeout pour s'assurer que le modal est correctement initialisé
    setTimeout(() => {
      const modal = new bootstrap.Modal(document.getElementById('applicationDetailsModal')!);
      modal.show();
    }, 100);
  }

  // Fonction pour obtenir l'URL de l'image de profil
  getProfileImageUrl(profilePicture: string | undefined): string {
    if (!profilePicture) {
      return '/assets/images/avatar.png'; // URL par défaut pour les utilisateurs sans photo
    }
    return `${baseUrl}/files/images/${profilePicture}`;
  }

  // Fonction pour obtenir le nom du statut
  getStatusName(status: string): string {
    return this.applicationStatusMap[status] || status;
  }

  // Fonction pour obtenir le nom du type de candidature
  getApplicationTypeName(type: string): string {
    return this.applicationTypeMap[type] || type;
  }

  // Fonction pour obtenir le nom du type de document
  getDocumentTypeName(type: string): string {
    return this.documentTypeMap[type] || type;
  }

  // Fonction pour obtenir la classe CSS du statut
  getStatusClass(status: string): string {
    switch (status) {
      case 'ACCEPTED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      case 'PENDING': return 'bg-warning text-dark';
      case 'UNDER_REVIEW': return 'bg-info';
      case 'CANCELLED': return 'bg-secondary';
      default: return 'bg-info';
    }
  }


  // Fonction pour voir un document
  viewDocument(document: Document) {
    // Construire l'URL vers le document en utilisant le chemin relatif
    // Le filePath commence par "/api/documents/..." donc on le concatène à l'URL de base
    const documentUrl = `http://localhost:8080${document.filePath}`;
    window.open(documentUrl, '_blank');
  }

  approveApplication(applicationId: string) {
    Swal.fire({
      title: 'Confirmation',
      text: 'Voulez-vous vraiment approuver cette candidature ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, approuver',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.annonceService.updateApplicationStatus(applicationId, 'ACCEPTED').subscribe(
          (response) => {
            Swal.fire('Succès', 'Candidature approuvée avec succès', 'success');
            // Mettre à jour l'UI après la réponse
            if (this.selectedApplication && this.selectedApplication.id === applicationId) {
              this.selectedApplication.status = 'ACCEPTED';
            }
            // Recharger les candidatures
            if (this.announcementId) {
              this.loadApplicationsByAnnouncement(this.announcementId);
            }
          },
          (error) => {
            console.error('Erreur lors de l\'approbation de la candidature', error);
            Swal.fire('Erreur', 'Une erreur est survenue lors de l\'approbation', 'error');
          }
        );
      }
    });
  }

  rejectApplication(applicationId: string) {
    // Fermer d'abord le modal Bootstrap s'il est ouvert
    const modalElement = document.getElementById('applicationDetailsModal');
    if (modalElement) {
      const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }

    // Attendre que le modal soit fermé
    setTimeout(() => {
      Swal.fire({
        title: 'Raison du rejet',
        html: '<textarea id="rejection-reason" class="swal2-textarea" placeholder="Entrez la raison du rejet..." style="display: flex; justify-content:center; width:350px ; height: 100px;resize:none;overflow-x:hidden"></textarea>',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Rejeter',
        cancelButtonText: 'Annuler',
        didOpen: () => {
          document.getElementById('rejection-reason')?.focus();
        },
        preConfirm: () => {
          const reasonEl = document.getElementById('rejection-reason') as HTMLTextAreaElement;
          return reasonEl.value || 'Aucune raison spécifiée';
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const rejectionReason = result.value;
          this.annonceService.updateApplicationStatus(applicationId, 'REJECTED', rejectionReason).subscribe(
            (response) => {
              Swal.fire('Succès', 'Candidature rejetée avec succès', 'success');
              // Recharger les candidatures
              if (this.announcementId) {
                this.loadApplicationsByAnnouncement(this.announcementId);
              }
            },
            (error) => {
              console.error('Erreur lors du rejet de la candidature', error);
              Swal.fire('Erreur', 'Une erreur est survenue lors du rejet', 'error');
            }
          );
        }
      });
    }, 300);
  }

  // Ajouter une nouvelle fonction pour mettre à jour le statut à "UNDER_REVIEW"
  markAsUnderReview(applicationId: string) {
    Swal.fire({
      title: 'Confirmation',
      text: 'Voulez-vous marquer cette candidature comme étant en cours d\'examen ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.annonceService.updateApplicationStatus(applicationId, 'UNDER_REVIEW').subscribe(
          (response) => {
            Swal.fire('Succès', 'Statut mis à jour avec succès', 'success');
            // Mettre à jour l'UI après la réponse
            if (this.selectedApplication && this.selectedApplication.id === applicationId) {
              this.selectedApplication.status = 'UNDER_REVIEW';
            }
            // Recharger les candidatures
            if (this.announcementId) {
              this.loadApplicationsByAnnouncement(this.announcementId);
            }
          },
          (error) => {
            console.error('Erreur lors de la mise à jour du statut', error);
            Swal.fire('Erreur', 'Une erreur est survenue lors de la mise à jour', 'error');
          }
        );
      }
    });
  }
  // Modifier la fonction de recherche pour prendre en compte les candidatures
  onSearch() {
    if (this.announcementId) {
      // Recherche dans les candidatures
      this.applications = this.dataSource.filter(app =>
        app.candidate?.firstName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        app.candidate?.lastName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        app.candidate?.email?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        app.status.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      // Recherche dans les utilisateurs (code existant)
      this.loginService.getAllUsers().subscribe(
        (data) => {
          this.users = data.filter((user) =>
            user.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            user.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        },
        (error) => {
          console.error('Erreur lors de la récupération des utilisateurs', error);
        }
      );
    }
  }

  // 🔹 Charger tous les utilisateurs
  getUsers() {
    this.loginService.getAllUsers().subscribe(
      (data) => {
        this.users = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des utilisateurs', error);
      }
    );
  }

  // 🔹 Supprimer un utilisateur
  deleteUser(email: string) {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      this.loginService.deleteUser(email).subscribe(
        () => {
          this.users = this.users.filter(user => user.email !== email);
          console.log('Utilisateur supprimé');
        },
        (error) => {
          console.error('Erreur lors de la suppression de l\'utilisateur', error);
        }
      );
    }
  }
}
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginService } from '../services/login.service';
import { ProfileService } from '../services/profile.service';
import Swal from 'sweetalert2';
import { baseUrl } from '../services/url';
import { HeaderComponent } from '../header/header.component';

// Déclaration pour Bootstrap Modal
declare var bootstrap: any;

type ApplicationStatus = 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
type ApplicationType = 'NEW' | 'RENEWAL';

interface Document {
  id: string;
  fileName: string;
  filePath: string;
  documentType: string;
  status: string;
  uploadDate: string;
}

interface Application {
  id: string;
  candidateId: string;
  announcementId: string;
  academicYearId: string;
  applicationType: ApplicationType;
  status: ApplicationStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  documents: Document[];
  announcement?: {
    title: string;
    id: string;
  };
  applicationDate?: string;
}

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    RouterModule,
    HeaderComponent
  ],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss'
})

export class ProfilComponent implements OnInit {

  constructor(
    private loginService: LoginService,
    private profileService: ProfileService
  ) { }

  user = {
    email: '',
    firstName: '',
    lastName: '',
    profilePicture: '',
    role: ''
  };

  originalUser = {
    profilePicture: ''
  };

  newProfilePicture: boolean = false;
  isEditing = false;
  isLoading = true;

  applications: Application[] = [];
  announcements: Record<string, { title: string }> = {};

  // Variable pour stocker la candidature sélectionnée pour le modal
  selectedApplication: Application | null = null;

  // Référence au modal
  private detailsModal: any;

  applicationStatusMap: Record<ApplicationStatus, string> = {
    'PENDING': 'En attente',
    'UNDER_REVIEW': 'En cours d\'examen',
    'ACCEPTED': 'Acceptée',
    'REJECTED': 'Rejetée',
    'CANCELED': 'Annulée'
  };

  applicationTypeMap: Record<ApplicationType, string> = {
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

  ngOnInit() {
    this.loadUserProfile();
    this.loadUserApplications();
  }

  ngAfterViewInit() {
    // Initialiser la référence au modal après le rendu de la vue
    const modalElement = document.getElementById('applicationDetailsModal');
    if (modalElement) {
      this.detailsModal = new bootstrap.Modal(modalElement);
    }
  }

  loadUserProfile() {
    this.isLoading = true;
    this.profileService.getUserProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.user.profilePicture = this.user.profilePicture ? `${baseUrl}/files/images/${this.user.profilePicture}` : '/assets/images/avatar.png';
        // Sauvegarde de l'URL originale de l'image
        this.originalUser.profilePicture = this.user.profilePicture;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil', err);
        this.isLoading = false;
        Swal.fire('Erreur', 'Impossible de charger votre profil.', 'error');
      }
    });
  }

  loadUserApplications() {
    this.profileService.getUserApplications().subscribe({
      next: (data: Application[]) => {
        console.log('Candidatures', data);

        // Traitement des données d'applications
        this.applications = data.map(app => {
          // Pour chaque application, récupérer les détails de l'annonce
          this.loadAnnouncementDetails(app.announcementId);

          // Ajouter la date de candidature à partir de createdAt
          return {
            ...app,
            applicationDate: app.createdAt
          };
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des candidatures', err);
        Swal.fire('Erreur', 'Impossible de charger vos candidatures.', 'error');
      }
    });
  }

  // Méthode pour charger les détails d'une annonce
  loadAnnouncementDetails(announcementId: string) {
    // Vérifier si on a déjà les détails de cette annonce
    if (!this.announcements[announcementId]) {
      // Ajouter une méthode getAnnouncementDetails dans ProfileService
      this.profileService.getAnnouncementDetails(announcementId).subscribe({
        next: (data) => {
          this.announcements[announcementId] = { title: data.title };

          // Mettre à jour les applications avec le titre de l'annonce
          this.applications = this.applications.map(app => {
            if (app.announcementId === announcementId) {
              return {
                ...app,
                announcement: { title: data.title, id: announcementId }
              };
            }
            return app;
          });
        },
        error: (err) => {
          console.error(`Erreur lors du chargement de l'annonce ${announcementId}`, err);
          // En cas d'erreur, utiliser un titre par défaut
          this.announcements[announcementId] = { title: `Annonce #${announcementId.substring(0, 8)}` };
        }
      });
    }
  }

  updateProfile() {
    this.isLoading = true;

    // Créer une copie des données à envoyer
    const userData = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      role: this.user.role
    };

    // Ajouter la photo de profil uniquement si elle a été modifiée
    if (this.newProfilePicture) {
      // @ts-ignore
      userData.profilePicture = this.user.profilePicture;
    }

    this.profileService.updateUserProfile(userData).subscribe({
      next: (response) => {
        // Mettre à jour le localStorage avec les nouvelles informations
        const userConnect = JSON.parse(localStorage.getItem('userConnect') || '{}');

        // Mettre à jour les propriétés existantes
        userConnect.firstName = this.user.firstName;
        userConnect.lastName = this.user.lastName;
        userConnect.email = this.user.email;

        // Si la photo de profil a été mise à jour et est présente dans la réponse
        if (response.profilePicture) {
          userConnect.profilePicture = response.profilePicture;
        }

        // Sauvegarder les changements dans le localStorage
        localStorage.setItem('userConnect', JSON.stringify(userConnect));

        // Notifier les autres composants que le profil a été mis à jour
        this.profileService.notifyProfileUpdate();

        this.isLoading = false;
        this.isEditing = false;
        this.newProfilePicture = false;
        Swal.fire('Succès', 'Profil mis à jour avec succès', 'success');
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour', err);
        this.isLoading = false;
        Swal.fire('Erreur', 'La mise à jour du profil a échoué.', 'error');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.profilePicture = e.target.result;
        this.newProfilePicture = true;
      };
      reader.readAsDataURL(file);
    }
  }

  enableEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
    // Restaurer l'image originale
    this.user.profilePicture = this.originalUser.profilePicture;
    this.newProfilePicture = false;
    this.loadUserProfile(); 
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACCEPTED': return 'status-accepted';
      case 'REJECTED': return 'status-rejected';
      case 'PENDING': return 'status-pending';
      case 'CANCELED': return 'status-canceled';
      case 'UNDER_REVIEW': return 'bg-info';
      default: return '';
    }
  }

  cancelApplication(applicationId: string) {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Voulez-vous vraiment annuler cette candidature?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF6600',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        this.profileService.cancelApplication(applicationId).subscribe({
          next: () => {
            Swal.fire('Annulée', 'Votre candidature a été annulée.', 'success');
            this.loadUserApplications(); // Recharger les candidatures
          },
          error: (err) => {
            console.error('Erreur lors de l\'annulation', err);
            Swal.fire('Erreur', 'Impossible d\'annuler la candidature.', 'error');
          }
        });
      }
    });
  }

  getFormattedDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  // Méthode pour visualiser les documents
  viewDocument(document: Document) {
    // Construire l'URL vers le document en utilisant le chemin relatif
    // Le filePath commence par "/api/documents/..." donc on le concatène à l'URL de base
    const documentUrl = `http://localhost:8080${document.filePath}`;
    window.open(documentUrl, '_blank');
  }

  // Méthode pour obtenir le nombre total de documents pour une candidature
  getDocumentCount(application: Application): number {
    return application.documents?.length || 0;
  }

  // Méthode pour obtenir le libellé du type de candidature
  getApplicationType(type: ApplicationType): string {
    return this.applicationTypeMap[type] || type;
  }

  // Méthode pour obtenir le libellé du type de document
  getDocumentType(type: string): string {
    return this.documentTypeMap[type] || type;
  }

  // Méthode pour tronquer le titre
  truncateTitle(title: string, maxLength: number = 10): string {
    if (!title) return '';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  }

  // Méthode pour afficher le modal avec les détails
  showApplicationDetails(application: Application) {
    this.selectedApplication = application;
    if (this.detailsModal) {
      this.detailsModal.show();
    } else {
      // Initialiser le modal s'il n'existe pas encore
      const modalElement = document.getElementById('applicationDetailsModal');
      if (modalElement) {
        this.detailsModal = new bootstrap.Modal(modalElement);
        this.detailsModal.show();
      }
    }
  }

  // Méthode pour annuler une candidature depuis le modal
  cancelApplicationFromModal() {
    if (this.selectedApplication) {
      this.cancelApplication(this.selectedApplication.id);
      // Fermer le modal après confirmation
      if (this.detailsModal) {
        this.detailsModal.hide();
      }
    }
  }
}
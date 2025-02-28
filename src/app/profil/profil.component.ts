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
import { Router } from '@angular/router';
import { UserService } from '../services/user-service.service';

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
    private profileService: ProfileService,
    private userService: UserService,

    private router: Router
  ) { }

  user = {
    email: '',
    firstName: '',
    lastName: '',
    profilePicture: '',
    role: ''
  };

  passwordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  originalUser = {
    profilePicture: ''
  };

  newProfilePicture: boolean = false;
  isEditing = false;
  isLoading = true;
  showPasswordFields = false; // Nouvelle variable pour gérer l'affichage des champs de mot de passe

  applications: Application[] = [];
  announcements: Record<string, { title: string, endDate?: string }> = {};

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

  // Nouvelle méthode pour basculer l'affichage des champs de mot de passe
  togglePasswordFields() {
    this.showPasswordFields = !this.showPasswordFields;

    // Réinitialiser les champs si on les cache
    if (!this.showPasswordFields) {
      this.passwordData = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
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
          this.announcements[announcementId] = {
            title: data.title,
            endDate: data.closingDate // Supposons que l'API retourne endDate
          };

          // Mettre à jour les applications avec le titre de l'annonce et sa date de fin
          this.applications = this.applications.map(app => {
            if (app.announcementId === announcementId) {
              return {
                ...app,
                announcement: {
                  title: data.title,
                  id: announcementId,
                  closingDate: data.endDate
                }
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

  editApplication(application: Application) {
    if (application.status !== 'UNDER_REVIEW' && application.status !== 'PENDING') {
      Swal.fire('Information', 'Seules les candidatures en cours d\'examen peuvent être modifiées.', 'info');
      return;
    }

    // Rediriger vers la page de modification avec l'ID de la candidature
    this.router.navigate(['/edit-application', application.id]);
  }

  // Méthode pour éditer une candidature depuis le modal
  editApplicationFromModal() {
    if (this.selectedApplication) {
      this.editApplication(this.selectedApplication);
      // Fermer le modal après redirection
      if (this.detailsModal) {
        this.detailsModal.hide();
      }
    }
  }


  updateProfile() {
    // Vérifier si les mots de passe correspondent
    if (this.passwordData.newPassword && this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      Swal.fire('Erreur', 'Les mots de passe ne correspondent pas.', 'error');
      return;
    }

    this.isLoading = true;

    // Créer une copie des données à envoyer
    const userData: any = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      role: this.user.role
    };

    // Ajouter la photo de profil uniquement si elle a été modifiée
    if (this.newProfilePicture) {
      userData.profilePicture = this.user.profilePicture;
    }

    // Ajouter les informations de mot de passe si fournies
    if (this.passwordData.oldPassword && this.passwordData.newPassword) {
      userData.oldPassword = this.passwordData.oldPassword;
      userData.password = this.passwordData.newPassword;
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
        this.showPasswordFields = false; // Réinitialiser l'affichage des champs de mot de passe

        // Réinitialiser les champs de mot de passe
        this.passwordData = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };

        Swal.fire('Succès', 'Profil mis à jour avec succès', 'success');
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour', err);
        this.isLoading = false;

        // Récupérer le message d'erreur du backend
        let errorMessage = 'La mise à jour du profil a échoué.';

        // Si l'erreur est une chaîne directe (comme dans votre cas)
        if (typeof err.error === 'string') {
          errorMessage = err.error;
        }
        // Si l'erreur est un objet avec une propriété message
        else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }

        Swal.fire('Erreur', errorMessage, 'error');
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
    this.showPasswordFields = false; // Cacher les champs de mot de passe à l'activation du mode édition
    // Réinitialiser les champs de mot de passe
    this.passwordData = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  cancelEditing() {
    this.isEditing = false;
    this.showPasswordFields = false; // Réinitialiser l'affichage des champs de mot de passe
    // Restaurer l'image originale
    this.user.profilePicture = this.originalUser.profilePicture;
    this.newProfilePicture = false;
    // Réinitialiser les champs de mot de passe
    this.passwordData = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
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

  // Méthode pour demander confirmation avant la suppression du compte
confirmDeleteAccount() {
  Swal.fire({
    title: 'Supprimer votre compte ?',
    text: "Cette action est irréversible. Toutes vos données seront définitivement supprimées.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Oui, supprimer mon compte',
    cancelButtonText: 'Annuler',
    footer: '<span class="text-muted">Vous ne pourrez pas récupérer vos données après cette action</span>'
  }).then((result) => {
    if (result.isConfirmed) {
      // Demander le mot de passe pour confirmation
      Swal.fire({
        title: 'Confirmation par mot de passe',
        input: 'password',
        inputLabel: 'Pour des raisons de sécurité, veuillez saisir votre mot de passe',
        inputPlaceholder: 'Votre mot de passe',
        confirmButtonText: 'Confirmer',
        showCancelButton: true,
        cancelButtonText: 'Annuler',
        inputValidator: (value) => {
          if (!value) {
            return 'Vous devez saisir votre mot de passe';
          }
          return null;
        }
      }).then((passwordResult) => {
        if (passwordResult.isConfirmed) {
          this.deleteAccount(passwordResult.value);
        }
      });
    }
  });
}

// Méthode pour effectuer la suppression du compte
deleteAccount(password: string) {
  this.isLoading = true;
  
  this.userService.deleteUserAccount(password).subscribe({
    next: () => {
      this.isLoading = false;
      Swal.fire({
        title: 'Compte supprimé',
        text: 'Votre compte a été définitivement supprimé.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        // Déconnexion et redirection vers la page d'accueil
        this.loginService.logout();
        this.router.navigate(['/login']);
      });
    },
    error: (err) => {
      console.error('Erreur lors de la suppression du compte', err);
      this.isLoading = false;
      
      // Récupérer le message d'erreur du backend
      let errorMessage = 'La suppression du compte a échoué.';
      
      if (typeof err.error === 'string') {
        errorMessage = err.error;
      } else if (err.error && err.error.message) {
        errorMessage = err.error.message;
      } else if (err.status === 401) {
        errorMessage = 'Mot de passe incorrect.';
      }
      
      Swal.fire('Erreur', errorMessage, 'error');
    }
  });
}
}
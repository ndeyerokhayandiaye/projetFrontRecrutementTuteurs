import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { ProfileService } from '../services/profile.service';
import { AnnonceService } from '../services/annonce.service';
import Swal from 'sweetalert2';
import { HttpClientModule } from '@angular/common/http';

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
  applicationType: 'NEW' | 'RENEWAL';
  status: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  documents: Document[];
  announcement?: {
    title: string;
    id: string;
  };
}

@Component({
  selector: 'app-edit-application',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HeaderComponent,
    HttpClientModule
  ],
  templateUrl: './edit-application.component.html',
  styleUrl: './edit-application.component.scss'
})
export class EditApplicationComponent implements OnInit {
  editForm: FormGroup;
  application: Application | null = null;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  applicationId: string = '';
  documentTypeMap: Record<string, string> = {
    'DIPLOMA': 'Diplôme',
    'MOTIVATION_LETTER': 'Lettre de motivation',
    'CV': 'CV',
    'IDENTITY_DOCUMENT': 'Pièce d\'identité',
    'OTHER': 'Autre document'
  };
  
  documentToDelete: string[] = [];
  applicationTypeMap: Record<string, string> = {
    'NEW': 'Nouvelle',
    'RENEWAL': 'Renouvellement'
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private profileService: ProfileService,
    private annonceService: AnnonceService
  ) {
    this.editForm = this.fb.group({
      applicationType: ['', Validators.required],
      diplome: [null],
      cv: [null],
      lettreMotivation: [null],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.applicationId = params['id'];
      this.loadApplication();
    });
  }

  loadApplication(): void {
    this.isLoading = true;
    this.profileService.getUserApplications().subscribe({
      next: (applications: Application[]) => {
        const app = applications.find(app => app.id === this.applicationId);
        if (app) {
          this.application = app;
          
          // Charger les détails de l'annonce si nécessaire
          if (app.announcementId && (!app.announcement || !app.announcement.title)) {
            this.loadAnnouncementDetails(app.announcementId);
          }
          
          // Initialiser le formulaire avec les valeurs existantes
          this.editForm.patchValue({
            applicationType: app.applicationType
          });
          
          this.isLoading = false;
        } else {
          this.handleApplicationNotFound();
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la candidature', err);
        this.isLoading = false;
        Swal.fire('Erreur', 'Impossible de charger les détails de la candidature.', 'error');
        this.router.navigate(['/profil']);
      }
    });
  }

  loadAnnouncementDetails(announcementId: string): void {
    this.annonceService.getAnnouncementDetails(announcementId).subscribe({
      next: (data) => {
        if (this.application) {
          this.application.announcement = {
            title: data.title,
            id: announcementId
          };
        }
      },
      error: (err) => {
        console.error(`Erreur lors du chargement de l'annonce ${announcementId}`, err);
      }
    });
  }

  handleApplicationNotFound(): void {
    Swal.fire({
      title: 'Candidature non trouvée',
      text: 'La candidature que vous souhaitez modifier n\'existe pas ou vous n\'avez pas les droits pour y accéder.',
      icon: 'error',
      confirmButtonColor: '#FF6600'
    }).then(() => {
      this.router.navigate(['/profil']);
    });
  }

  onFileChange(event: any, fieldName: string): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      
      if (file.type !== "application/pdf") {
        Swal.fire("Attention", "Seuls les fichiers PDF sont acceptés !", "warning");
        this.editForm.get(fieldName)?.setValue(null);
        return;
      }
      
      this.editForm.get(fieldName)?.setValue(file);
    }
  }

  getDocumentType(type: string): string {
    return this.documentTypeMap[type] || type;
  }

  viewDocument(document: Document): void {
    const documentUrl = `http://localhost:8080${document.filePath}`;
    window.open(documentUrl, '_blank');
  }

  async submitForm(): Promise<void> {
    if (this.editForm.invalid) {
      Swal.fire("Erreur", "Veuillez remplir correctement tous les champs obligatoires.", "error");
      return;
    }
    
    this.isSubmitting = true;
    
    try {
      const { applicationType } = this.editForm.value;
      const diplomeFile = this.editForm.get('diplome')?.value;
      const cvFile = this.editForm.get('cv')?.value;
      const lettreMotivationFile = this.editForm.get('lettreMotivation')?.value;
      
      const documents = [];
      
      // Préparation des nouveaux documents
      if (diplomeFile) {
        documents.push({
          base64Content: await this.toBase64(diplomeFile),
          originalFilename: diplomeFile.name,
          documentType: "DIPLOMA"
        });
      }
      
      if (cvFile) {
        documents.push({
          base64Content: await this.toBase64(cvFile),
          originalFilename: cvFile.name,
          documentType: "CV"
        });
      }
      
      if (lettreMotivationFile) {
        documents.push({
          base64Content: await this.toBase64(lettreMotivationFile),
          originalFilename: lettreMotivationFile.name,
          documentType: "MOTIVATION_LETTER"
        });
      }

      const payload = {
        applicationType: applicationType.toUpperCase(),
        documents: documents
      };
      
      this.profileService.updateApplication(this.applicationId, payload).subscribe({
        next: (response) => {
          Swal.fire({
            title: "Succès",
            text: "Votre candidature a été mise à jour avec succès!",
            icon: "success",
            confirmButtonColor: "#FF6600"
          }).then(() => {
            this.router.navigate(['/profil']);
          });
        },
        error: (err) => {
          console.error("Erreur lors de la mise à jour:", err);
          Swal.fire({
            title: "Erreur",
            text: err.error?.message || "Une erreur est survenue lors de la mise à jour de votre candidature.",
            icon: "error",
            confirmButtonColor: "#FF6600"
          });
          this.isSubmitting = false;
        }
      });
    } catch (error) {
      console.error("Erreur de conversion:", error);
      Swal.fire("Erreur", "Impossible de traiter les fichiers!", "error");
      this.isSubmitting = false;
    }
  }

  toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result!.toString());
      };
      reader.onerror = error => reject(error);
    });
  }

  cancel(): void {
    Swal.fire({
      title: 'Annuler les modifications?',
      text: "Les modifications non enregistrées seront perdues.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FF6600',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non, continuer les modifications'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/profil']);
      }
    });
  }

  getApplicationTypeLabel(type: string): string {
    return this.applicationTypeMap[type as keyof typeof this.applicationTypeMap] || type;
  }
}
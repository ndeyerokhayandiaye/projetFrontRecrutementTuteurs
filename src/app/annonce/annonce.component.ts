import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { AnnonceService } from '../services/annonce.service';
import * as bootstrap from 'bootstrap';
import { LoginService } from '../services/login.service';
import Swal from 'sweetalert2';
import { HeaderComponent } from '../header/header.component';
import { LoginComponent } from '../login/login.component';
import { FooterComponent } from '../footer/footer.component';


@Component({
  selector: 'app-annonce',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    MatSelectModule,
    MatOptionModule,
    HttpClientModule,
    HeaderComponent,
    LoginComponent,
    RouterModule,
    FooterComponent,
  ],

  templateUrl: './annonce.component.html',
  styleUrl: './annonce.component.scss'
})
export class AnnonceComponent implements OnInit {
  annonces: any[] = [];
  dataSource: any[] = [];

  annonceParPage = 6;
  pageActuelle = 1;

  selectedAnnonce: any = null;


  postulerForm: FormGroup;
  isSubmitting = false;
  isAuthenticated = false;
  constructor(
    private fb: FormBuilder,
    private annonceService: AnnonceService,
    private loginService: LoginService,
    private http: HttpClient,
    private router: Router
  ) {
    this.postulerForm = this.fb.group({
      applicationType: ['', Validators.required],
      diplome: [null],
      cv: [null],
      lettreMotivation: [null],
    }, { validators: this.atLeastOneDocumentValidator });
  }

  atLeastOneDocumentValidator(group: FormGroup): { [key: string]: any } | null {
    const diplome = group.get('diplome')?.value;
    const cv = group.get('cv')?.value;
    const lettreMotivation = group.get('lettreMotivation')?.value;

    // Vérifier si au moins un document est fourni
    if (!diplome && !cv && !lettreMotivation) {
      return { 'atLeastOneDocumentRequired': true };
    }

    return null;
  }



  ngOnInit(): void {
    this.loadAnnonces();
    this.isAuthenticated = this.loginService.isLoggedIn();

    // Configurer l'écouteur d'événement pour le modal une seule fois
    const modalElement = document.getElementById('postulerModal');
    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', this.handleModalClose.bind(this));
    }
  }
  handleModalClose() {
    this.postulerForm.reset();
    this.resetFileInputs();
    this.selectedAnnonce = null;
  }

  ngOnDestroy() {
    const modalElement = document.getElementById('postulerModal');
    if (modalElement) {
      modalElement.removeEventListener('hidden.bs.modal', this.handleModalClose.bind(this));
    }
  }

  loadAnnonces() {
    this.annonceService.getAnnonces().subscribe({
      next: (data) => {
        // Filtrer uniquement les annonces avec status "PUBLISHED"
        this.annonces = data.filter(annonce => annonce.status === 'PUBLISHED');
        this.dataSource = this.annonces;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des annonces', error);
      }
    });
  }

  getAnnoncePage(): any[] {
    const indexDebut = (this.pageActuelle - 1) * this.annonceParPage;
    const indexFin = indexDebut + this.annonceParPage;
    return this.annonces.slice(indexDebut, indexFin);
  }

  openPostulerModal(annonce: any) {
    console.log('Annonce sélectionnée:', annonce);

    // Réinitialiser complètement le formulaire et les fichiers
    this.postulerForm.reset();
    this.resetFileInputs();

    this.selectedAnnonce = annonce;
  }

  resetFileInputs() {
    // Réinitialiser visuellement les input file
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => {
      (input as HTMLInputElement).value = '';
    });
  }


  get pages(): number[] {
    const totalPages = Math.ceil(this.annonces.length / this.annonceParPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  get totalPages(): number {
    return Math.ceil(this.annonces.length / this.annonceParPage);
  }


  toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Nous gardons le préfixe data:application/pdf;base64,
        resolve(reader.result!.toString());
      };
      reader.onerror = error => reject(error);
    });
  }


  async submitPostulation() {
    if (!this.isAuthenticated) {
      Swal.fire("warning", "Vous devez être connecté pour postuler !", "warning").then(() => {
        window.location.href = "/login";
      });
      return;
    }

    if (this.postulerForm.invalid) {
      if (this.postulerForm.errors?.['atLeastOneDocumentRequired']) {
        Swal.fire("Erreur", "Veuillez fournir au moins un document (Diplôme, CV ou Lettre de motivation) !", "error");
      } else {
        Swal.fire("Erreur", "Veuillez remplir tous les champs obligatoires !", "error");
      }
      return;
    }

    this.isSubmitting = true;

    const { applicationType } = this.postulerForm.value;
    const diplomeFile = this.postulerForm.get('diplome')?.value;
    const cvFile = this.postulerForm.get('cv')?.value;
    const lettreMotivationFile = this.postulerForm.get('lettreMotivation')?.value;

    try {
      const documents = [];

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
        announcementId: this.selectedAnnonce.id || "",  // ID de l'annonce sélectionnée
        academicYearId: this.selectedAnnonce.academicYearId || "",  // academicYearId de l'annonce
        applicationType: applicationType.toUpperCase(),
        documents: documents,
      };

      this.annonceService.postuler(payload).subscribe({
        // Dans la partie success du submitPostulation
        next: response => {
          Swal.fire({
            title: "Succès",
            text: "Candidature envoyée avec succès !",
            icon: "success",
            confirmButtonColor: "#FF6600"
          }).then(() => {
            // Fermer le modal
            const modalElement = document.getElementById('postulerModal');
            if (modalElement) {
              const modalInstance = bootstrap.Modal.getInstance(modalElement);
              if (modalInstance) {
                modalInstance.hide();
              }
            }

            // Réinitialiser complètement
            this.postulerForm.reset();
            this.resetFileInputs();
            this.isSubmitting = false;
            this.selectedAnnonce = null;

            window.location.href = "/annonce";
          });
        },
        error: err => {
          console.error("Erreur :", err);
          if (err.status === 401 || err.status === 403) {
            Swal.fire({
              title: "Session expirée",
              text: "Votre session a expiré, veuillez vous reconnecter.",
              icon: "warning",
              confirmButtonColor: "#FF6600"
            });
          } else {
            Swal.fire({
              title: "Erreur",
              text: err.error?.message || "Une erreur est survenue lors de la soumission de votre candidature.",
              icon: "error",
              confirmButtonColor: "#FF6600"
            }).then(() => {
              this.postulerForm.reset();
              this.isSubmitting = false;
              this.selectedAnnonce = null;
            });
          }
          this.isSubmitting = false;
        }
      });
    } catch (error) {
      console.error("Erreur de conversion :", error);
      Swal.fire("warning", "Impossible de traiter les fichiers !", "warning");
      this.isSubmitting = false;
    }
  }

  onFileChange(event: any, fieldName: string) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];


      if (file.type !== "application/pdf") {
        Swal.fire("warning", "Seuls les fichiers PDF sont acceptés !", "warning");

        this.postulerForm.get(fieldName)?.setValue(null);
        return;
      }

      this.postulerForm.get(fieldName)?.setValue(file);
    }
  }
}

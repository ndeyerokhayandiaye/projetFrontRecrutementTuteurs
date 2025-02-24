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
import { AnnonceService } from '../admin/services/annonce.service';
import * as bootstrap from 'bootstrap';
import { LoginService } from '../services/login.service';
import Swal from 'sweetalert2';


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
  ],
  templateUrl: './annonce.component.html',
  styleUrl: './annonce.component.scss'
})
export class AnnonceComponent implements OnInit {
  annonces: any[] = [];
  dataSource: any[] = [];

  annonceParPage = 6;
  pageActuelle = 1;

  
  postulerForm: FormGroup;
  isSubmitting = false;
  isAuthenticated = false; // Stocke l'état de connexion
  // selectedFiles: { [key: string]: File } = {};

  constructor(
    private fb: FormBuilder,
    private annonceService: AnnonceService,
    private loginService: LoginService,
    private http: HttpClient,
    private router: Router
  ) {
    this.postulerForm = this.fb.group({
      applicationType: ['', Validators.required],
      diplome: [null, Validators.required],
      cv: [null, Validators.required],
      lettreMotivation: [null, Validators.required],

    });
  }



  ngOnInit(): void {
    this.loadAnnonces();
    this.isAuthenticated = this.loginService.isLoggedIn(); // Verifie si l'utilisateur est connecté
  }

  loadAnnonces() {
    this.annonceService.getAnnonces().subscribe({
      next: (data) => {
        console.log("Données récupérées :", data);
        this.annonces = data;
        this.dataSource = data;
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
      reader.onload = () => resolve(reader.result!.toString().split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }

  async submitPostulation() {

    if (!this.isAuthenticated) {
      Swal.fire("warning", "Vous devez être connecté pour postuler !", "warning");

      this.router.navigate(['/login']);
      return;
    }

    if (this.postulerForm.invalid) {
      Swal.fire("error", "Veuillez remplir tous les champs !", "error");

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
          documentType: "DIPLOME"
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
          documentType: "LETTRE-MOTIVATION"
        });
      }

      const payload = {
        announcementId: "",
        academicYearId: "",
        applicationType: applicationType.toUpperCase(),
        documents: documents,

      };

      this.annonceService.postuler(payload).subscribe({
        next: response => {
          Swal.fire("Succès", "Candidature envoyée avec succès !", "success");

          this.postulerForm.reset();
          this.isSubmitting = false;

          const modalElement = document.getElementById('postulerModal');
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
              modalInstance.hide();
            }
          } else {
            console.error("Modal 'postulerModal' introuvable.");
          }
        },
        error: err => {
          console.error("Erreur :", err);
          Swal.fire("error", "Une erreur est survenue !", "error");
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

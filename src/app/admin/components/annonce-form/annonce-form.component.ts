import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { AnnonceService } from '../../../services/annonce.service';
import { Router, RouterModule } from '@angular/router';
import { AcademicYear } from '../annee-academique-list/annee-academique-list.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { LoginService } from '../../../services/login.service';
import Swal from 'sweetalert2';

// Fonction de validation personnalisée pour vérifier les dates
export function dateValidator(): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const publicationDate = formGroup.get('publicationDate')?.value;
    const closingDate = formGroup.get('closingDate')?.value;
    const today = new Date();
    
    // Vérifie si les dates sont sélectionnées
    if (!publicationDate || !closingDate) {
      return null;
    }
    
    const errors: ValidationErrors = {};
    
    // Vérifie que la date de publication n'est pas postérieure à la date de clôture
    if (new Date(publicationDate) > new Date(closingDate)) {
      errors['publicationAfterClosing'] = true;
    }
    
    // Vérifie que les dates ne sont pas postérieures à la date actuelle
    if (new Date(publicationDate) < today) {
      errors['publicationInFuture'] = true;
    }
    
    if (new Date(closingDate) < today) {
      errors['closingInFuture'] = true;
    }
    
    // Vérifie que l'année de publication n'est pas antérieure à l'année actuelle
    const pubYear = new Date(publicationDate).getFullYear();
    const currentYear = today.getFullYear();
    
    if (pubYear < currentYear) {
      errors['publicationYearBeforeCurrent'] = true;
    }
    
    return Object.keys(errors).length ? errors : null;
  };
}

@Component({
  selector: 'app-annonce-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    RouterModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
  ],
  templateUrl: './annonce-form.component.html',
  styleUrl: './annonce-form.component.scss'
})
export class AnnonceFormComponent implements OnInit {
  academicYears: AcademicYear[] = [];
  filteredAcademicYears: AcademicYear[] = [];
  searchQuery: string = '';
  loading = false;
  errorMessage: string | null = null;
  annonces: any[] = [];
  isEditing = false;
  annonceForm!: FormGroup;
  selectedAnnonceId: number | null = null;
  displayedColumns: string[] = ['id', 'title', 'description', 'actions'];
  dataSource: any[] = []; // Ou l'initialiser avec les données appropriées
  userId: string | null = null;
  today = new Date().toISOString().split('T')[0]; // Date du jour au format YYYY-MM-DD
  minDate = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]; // Premier jour de l'année actuelle

  constructor(
    private fb: FormBuilder, 
    private annonceService: AnnonceService, 
    private router: Router,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.loadAcademicYears();
    this.annonceForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      publicationDate: ['', Validators.required],
      closingDate: ['', Validators.required],
      status: ['PUBLISHED', Validators.required],
      academicYearId: ['', Validators.required],
      createdById: this.userId,
    }, { validators: dateValidator() });
  }

  // Getters pour les messages d'erreur personnalisés
  get hasDateErrors(): boolean {
    return this.annonceForm.errors !== null && 
           (this.annonceForm.errors['publicationAfterClosing'] || 
            this.annonceForm.errors['publicationInFuture'] || 
            this.annonceForm.errors['closingInFuture'] ||
            this.annonceForm.errors['publicationYearBeforeCurrent']);
  }

  get publicationAfterClosingError(): boolean {
    return this.annonceForm.errors?.['publicationAfterClosing'] === true;
  }

  get publicationInFutureError(): boolean {
    return this.annonceForm.errors?.['publicationInFuture'] === true;
  }

  get closingInFutureError(): boolean {
    return this.annonceForm.errors?.['closingInFuture'] === true;
  }

  get publicationYearBeforeCurrentError(): boolean {
    return this.annonceForm.errors?.['publicationYearBeforeCurrent'] === true;
  }

  ajoutAnnonce() {
    if (this.annonceForm.invalid) {
      // Vérifie spécifiquement les erreurs de date
      if (this.hasDateErrors) {
        let errorMessage = 'Erreur de validation des dates: ';
        if (this.publicationAfterClosingError) {
          errorMessage += 'La date de publication ne peut pas être postérieure à la date limite. ';
        }
        if (this.publicationInFutureError) {
          errorMessage += 'La date de publication ne peut pas être antérieur à la date actuelle. ';
        }
        if (this.closingInFutureError) {
          errorMessage += 'La date limite ne peut pas être antérieur à la date actuelle. ';
        }
        if (this.publicationYearBeforeCurrentError) {
          errorMessage += 'L\'année de publication ne peut pas être antérieure à l\'année actuelle. ';
        }
        Swal.fire('Erreur', errorMessage, 'error');
      } else {
        Swal.fire('Erreur', 'Veuillez remplir correctement tous les champs.', 'error');
      }
      return;
    }

    const annonceData = {
      title: this.annonceForm.value.title,
      description: this.annonceForm.value.description,
      publicationDate: new Date(this.annonceForm.value.publicationDate).toISOString(),
      closingDate: new Date(this.annonceForm.value.closingDate).toISOString(),
      status: this.annonceForm.value.status,
      academicYearId: this.annonceForm.value.academicYearId
    };

    console.log('Annonce envoyée:', annonceData);
    console.log('Données envoyées:', JSON.stringify(annonceData));

    this.annonceService.addAnnonce(annonceData).subscribe({
      next: (response) => {
        Swal.fire('Succès', 'Annonce ajoutée avec succès', 'success').then(() => {
          this.router.navigate(['/admin/annonces']);
          this.resetForm();
        });
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout', err);
        Swal.fire('Erreur', 'Échec de l\'ajout de l\'annonce. Veuillez vérifier que vous avez fourni tous les champs et que les dates sont valides.', 'error');
      }
    });
  }

  resetForm() {
    this.annonceForm.reset({
      status: 'PUBLISHED'
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource = this.dataSource.filter(annonce =>
      annonce.title.toLowerCase().includes(filterValue) ||
      annonce.description.toLowerCase().includes(filterValue)
    );
  }

  loadAcademicYears() {
    this.loading = true;
    this.annonceService.getAllAcademicYears().subscribe({
      next: (data: AcademicYear[]) => {
        this.loading = false;
        this.academicYears = data;
        this.filteredAcademicYears = data;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Erreur lors du chargement des années académiques';
        console.error(error);
      }
    });
  }
}
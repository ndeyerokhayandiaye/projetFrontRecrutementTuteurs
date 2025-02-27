import { Component,OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AnnonceService } from '../../../services/annonce.service';
import { Router, RouterModule } from '@angular/router';
import { AcademicYear } from '../annee-academique-list/annee-academique-list.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { LoginService } from '../../../services/login.service';
import Swal from 'sweetalert2';

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


  constructor(private fb: FormBuilder, private annonceService: AnnonceService, private router: Router,private loginService: LoginService,
) {}

  ngOnInit(): void {
    this.loadAcademicYears();
    this.annonceForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      publicationDate: ['', Validators.required],
      closingDate: ['', Validators.required],
      status: ['DRAFT', Validators.required],
      academicYearId: ['', Validators.required],
      createdById: this.userId,
    });
  }

  ajoutAnnonce() {
    if (this.annonceForm.invalid) {
      Swal.fire('Erreur', 'Veuillez remplir correctement tous les champs.', 'error');
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
        Swal.fire('Succès', 'Annonce ajoutée avec succès', 'success');
        this.annonceForm.reset();
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout', err);
        Swal.fire('Erreur', 'Échec de l\'ajout de l\'annonce', 'error');
      }
    });
  }

  resetForm() {
    this.annonceForm.reset();
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

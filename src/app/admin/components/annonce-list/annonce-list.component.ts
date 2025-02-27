import { Component } from '@angular/core';
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
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import Swal from 'sweetalert2';
import * as bootstrap from 'bootstrap';
import { AnnonceService } from '../../../services/annonce.service';
import { AcademicYear } from '../annee-academique-list/annee-academique-list.component';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-annonce-list',
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
      HttpClientModule,
  ],
  templateUrl: './annonce-list.component.html',
  styleUrl: './annonce-list.component.scss'
})

export class AnnonceListComponent {
  annonces: any[] = [];
  displayedColumns: string[] = ['title', 'id', 'publicationDate', 'closingDate' ,'actions'];

  dataSource: any[] = [];
  annonceForm!: FormGroup;
  selectedAnnonce: any = null;
  academicYears: AcademicYear[] = [];
  filteredAcademicYears: AcademicYear[] = [];

  constructor(
    private annonceService: AnnonceService,
    private academicYearService:  AnnonceService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {} 


  ngOnInit(): void {
    this.loadAnnonces();
    this.loadAcademicYears();

    this.annonceForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      publicationDate: ['', Validators.required],
      closingDate: ['', Validators.required],
      status: ['', Validators.required],
      academicYearId: ['', Validators.required]
    });
  }

  loadAcademicYears() {
    this.academicYearService.getAllAcademicYears().subscribe({
      next: (data) => {
        this.academicYears = data;
        this.filteredAcademicYears = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des années académiques', error);
      }
    });
  }

  loadAnnonces() {
    this.annonceService.getAnnonces().subscribe({
      next: (data) => {
        this.annonces = data;
        this.dataSource = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des annonces', error);
      }
    });
  }

  editAnnonce(annonce: any) {
    this.selectedAnnonce = annonce;
    this.annonceForm.patchValue({
      title: annonce.title,
      description: annonce.description,
      publicationDate: annonce.publicationDate.split('T')[0],
      closingDate: annonce.closingDate.split('T')[0],
      status: annonce.status,
      academicYearId: annonce.academicYearId
    });

    setTimeout(() => {
      const modal = new bootstrap.Modal(document.getElementById('annonceModal')!);
      modal.show();
    }, 100);
  }

  updateAnnonce() {
    if (!this.selectedAnnonce || !this.selectedAnnonce.id) {
      console.error("Aucune annonce sélectionnée !");
      return;
    }

    // Récupérer les valeurs du formulaire
    const updatedAnnonce = {
      id: this.selectedAnnonce.id, // met à jour l'id de l'annonce
      academicYearId: this.annonceForm.value.academicYearId || this.selectedAnnonce.academicYearId,
      title: this.annonceForm.value.title,
      description: this.annonceForm.value.description,
      status: this.annonceForm.value.status || this.selectedAnnonce.status || "DRAFT",
      publicationDate: new Date(this.annonceForm.value.publicationDate).toISOString(),
      closingDate: new Date(this.annonceForm.value.closingDate).toISOString(),
      createdById: this.selectedAnnonce.createdById,

    };

    console.log("Données envoyées :", updatedAnnonce);
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
      'Content-Type': 'application/json'
    });

    this.http.put(`http://localhost:8080/api/job-announcements/${updatedAnnonce.id}`, updatedAnnonce, { headers })
      .subscribe(
        (response) => {
          console.log("Annonce mise à jour avec succès !", response);
          Swal.fire('Succès', 'Annonce modifiée avec succès', 'success');
          this.loadAnnonces();
          this.closeModal();
        },
        (error: any) => {
          console.error("Erreur lors de la mise à jour :", error);
          Swal.fire('Erreur', 'Échec de la modification', 'error');
        }
      );
  }

  closeModal() {
    this.selectedAnnonce = null;
    this.annonceForm.reset();
    const modal = document.getElementById('annonceModal');
    if (modal) {
      (modal as any).classList.remove('show');
      document.body.classList.remove('modal-open');
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource = this.annonces.filter(annonce =>
      annonce.title.toLowerCase().includes(filterValue) ||
      annonce.description.toLowerCase().includes(filterValue)
    );
  }

  deleteAnnonce(id: number) {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.annonceService.deleteAnnonce(id).subscribe({
          next: () => {
            Swal.fire('Supprimé !', 'L\'annonce a été supprimée.', 'success');
            this.annonces = this.annonces.filter(a => a.id !== id); // Supprime l'annonce de la liste locale
            this.dataSource = [...this.annonces]; // Met à jour le tableau
          },
          error: (err) => {
            console.error('Erreur suppression', err);
            Swal.fire('Erreur', 'Échec de la suppression.', 'error');
          }
        });
      }
    });
  }

}

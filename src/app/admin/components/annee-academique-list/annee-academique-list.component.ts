import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AnnonceService } from '../../services/annonce.service';
import Swal from 'sweetalert2';

export interface AcademicYear {
  id: string;
  yearName: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-annee-academique-list',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule,RouterModule,],
  templateUrl: './annee-academique-list.component.html',
  styleUrls: ['./annee-academique-list.component.scss'],
})
export class AnneeAcademiqueListComponent implements OnInit {
  academicYears: AcademicYear[] = [];
  filteredAcademicYears: AcademicYear[] = [];
  searchQuery: string = '';
  loading = false;
  errorMessage: string | null = null;

  selectedYear: AcademicYear = {
    id: '',
    yearName: '',
    startDate: '',
    endDate: ''
  };

  constructor(private annonceService: AnnonceService, private router: Router) {}

  ngOnInit() {
    this.loadAcademicYears();
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

  onSearch() {
    this.filteredAcademicYears = this.academicYears.filter((year) =>
      year.yearName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  deleteAcademicYear(id: string): void {
    Swal.fire({
      title: 'Confirmation',
      text: "Êtes-vous sûr de vouloir supprimer cette année académique ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.annonceService.deleteAcademicYear(id).subscribe(
          () => {
            console.log("L'année académique a été supprimée avec succès");
            Swal.fire("Succès", "L'année académique a été supprimée avec succès", "success");
            this.loadAcademicYears();
          },
          error => {
            console.error(error);
            Swal.fire("Erreur", "Une erreur s'est produite lors de la suppression", "error");
          }
        );
      }
    });
  }


  openModal(year: AcademicYear) {
    this.selectedYear = { ...year };
  }

  modificationAcademicYear() {
    this.annonceService.updateAcademicYear(this.selectedYear.id, this.selectedYear).subscribe({
      next: () => {
        console.log('Année mis à jour avec succès :');
        this.Alert("Succès", "Année modifiée avec succès", "success");
        this.loadAcademicYears();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour', error);
        alert("Erreur lors de la mise à jour de l'année académique");
        this.Alert("Error", "Erreur lors de la mise à jour de l'année académique", "Error");

      }
    });
  }


    Alert(title: string, text: string, icon: any) {
        Swal.fire({
          title,
          text,
          icon,
          timer: 1500
        });
      }

      
}

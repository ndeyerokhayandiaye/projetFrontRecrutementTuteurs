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
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

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
        MatTableModule
  ],
  templateUrl: './annonce-list.component.html',
  styleUrl: './annonce-list.component.scss'

})
export class AnnonceListComponent {





  dataSource = []; // Remplace ceci par les données de ton API
  displayedColumns: string[] = ['id', 'title', 'actions'];

  openForm() {
    console.log('Ouverture du formulaire'); // Remplace avec ton code d’ouverture
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log('Filtre appliqué:', filterValue); // Implémente le filtrage ici
  }

  editAnnonce(element: any) {
    console.log('Édition:', element); // Remplace avec ton code d’édition
  }

  deleteAnnonce(id: number) {
    console.log('Suppression de l’annonce ID:', id); // Remplace avec ton code de suppression
  }



}

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
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AnnonceService } from '../../services/annonce.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-annonce-form',
  standalone: true,
  imports: [CommonModule,
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

  ],
  templateUrl: './annonce-form.component.html',
  styleUrl: './annonce-form.component.scss'
})

export class AnnonceFormComponent implements OnInit {

  annonceForm: FormGroup;
  isEditing = false;
  dataSource: any[] = [];
  displayedColumns: string[] = ['id','title', 'description', 'actions'];

  constructor(private fb: FormBuilder, private annonceService: AnnonceService) {
    // this.annonceForm = this.fb.group({

    //   title: ['', Validators.required],
    //   description: ['', Validators.required],
    //   // requirements: ['', Validators.required],
    //   // location: ['', Validators.required],
    //   // salary: ['', Validators.required],
    //   postedAt: ['', Validators.required],
    //   deadline: ['', Validators.required]
    // });

    this.annonceForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      postedAt: ['', Validators.required],
      deadline: ['', Validators.required],
      academicYearId: ['3fa85f64-5717-4562-b3fc-2c963f66afa6', Validators.required], // Exemple
      status: ['DRAFT', Validators.required], // Statut par défaut
      createdById: ['3fa85f64-5717-4562-b3fc-2c963f66afa6', Validators.required], // Remplace par un vrai ID
    });


  }



  ngOnInit(): void {
  }





  // saveAnnonce(): void {
  //   if (this.annonceForm.valid) {
  //     if (this.isEditing) {
  //       this.annonceService.updateAnnonce(this.annonceForm.value.id, this.annonceForm.value).subscribe(() => {
  //         this.resetForm();
  //       });
  //     } else {
  //       this.annonceService.addAnnonce(this.annonceForm.value).subscribe(() => {
  //         this.resetForm();
  //       });
  //     }
  //   }
  // }

  saveAnnonce(): void {
    if (this.annonceForm.valid) {
      const formData = this.annonceForm.value;

      if (!this.isEditing) {
        // Supprimer l'id pour éviter l'erreur
        delete formData.id;
      }
      console.log('Données envoyées:/', formData);

      if (this.isEditing) {
        this.annonceService.updateAnnonce(formData.id, formData).subscribe(() => {
          this.resetForm();
        });
      } else {
        this.annonceService.addAnnonce(formData).subscribe(() => {
          this.resetForm();
        });
      }
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.annonceForm.reset();
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource = this.dataSource.filter(annonce =>
      annonce.titre.toLowerCase().includes(filterValue) ||
      annonce.description.toLowerCase().includes(filterValue)
    );
  }

}

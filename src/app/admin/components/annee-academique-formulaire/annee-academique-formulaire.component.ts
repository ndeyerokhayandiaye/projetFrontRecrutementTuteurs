import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { baseUrl } from '../../../services/url';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-annee-academique-formulaire',
  standalone: true,
  imports: [ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './annee-academique-formulaire.component.html',
  styleUrl: './annee-academique-formulaire.component.scss'
})
export class AnneeAcademiqueFormulaireComponent {

  academicYearForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.academicYearForm = this.fb.group({
      yearName: ['', [Validators.required, Validators.pattern('^\\d{4}-\\d{4}$')]],
      startDate: ['', Validators.required],
      endDate: ['', [Validators.required]],
      status: ['ACTIVE']
    }, { validators: this.validateDates });

    // Surveille les changements de startDate pour revalider endDate
    this.academicYearForm.get('startDate')?.valueChanges.subscribe(() => {
      this.academicYearForm.get('endDate')?.updateValueAndValidity();
    });
  }

  get yearName() {
    return this.academicYearForm.get('yearName')!;
  }

  get startDate() {
    return this.academicYearForm.get('startDate')!;
  }

  get endDate() {
    return this.academicYearForm.get('endDate')!;
  }

  // Validation globale : La date de fin doit être après la date de début
  validateDates(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;

    if (start && end && new Date(start) >= new Date(end)) {
      return { dateInvalid: true };
    }

    return null;
  }

  onSubmit() {
    if (this.academicYearForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    const formData = this.academicYearForm.value;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });

    this.http.post(`${baseUrl}/academic-years`, formData, { headers }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/annees-academiques']);
        this.Alert("Ajout réussi!", "Nouvelle année-académique ajoutée", "success");
        console.log('Données envoyées:', formData);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Erreur lors de l\'ajout de l\'année académique';
        this.Alert('Erreur', 'Erreur lors de l\'ajout de l\'année académique', 'error');
        console.error(error);
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

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { baseUrl } from '../../../services/url';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-annee-academique-formulaire',
  standalone: true,
  imports: [ReactiveFormsModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './annee-academique-formulaire.component.html',
  styleUrl: './annee-academique-formulaire.component.scss'
})
export class AnneeAcademiqueFormulaireComponent {

  academicYearForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.academicYearForm = this.fb.group({
      yearName: ['', [Validators.required, Validators.pattern('^\\d{4}-\\d{4}$'), this.validateYearNotInPast.bind(this)]],
      startDate: ['', [Validators.required, this.validateDateNotInPast.bind(this)]],
      endDate: ['', [Validators.required, this.validateDateNotInPast.bind(this)]],
      status: ['ACTIVE']
    }, { validators: this.validateDates });

    // Surveille les changements pour revalider le formulaire
    this.academicYearForm.get('startDate')?.valueChanges.subscribe(() => {
      this.academicYearForm.get('endDate')?.updateValueAndValidity();
    });
    
    this.academicYearForm.get('yearName')?.valueChanges.subscribe(() => {
      this.academicYearForm.get('startDate')?.updateValueAndValidity();
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

  // Validation pour s'assurer que l'année académique n'est pas dans le passé
  validateYearNotInPast(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const yearPattern = /^(\d{4})-(\d{4})$/;
    const match = control.value.match(yearPattern);
    
    if (match) {
      const startYear = parseInt(match[1], 10);
      if (startYear < this.currentYear) {
        return { yearInPast: true };
      }
    }
    
    return null;
  }

  // Validation pour s'assurer que les dates ne sont pas dans le passé
  validateDateNotInPast(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Réinitialiser l'heure pour comparer uniquement la date
    
    if (inputDate < today) {
      return { dateInPast: true };
    }
    
    // Vérifier également que la date correspond à l'année académique sélectionnée
    const yearNameControl = this.academicYearForm?.get('yearName');
    if (yearNameControl && yearNameControl.valid && yearNameControl.value) {
      const yearPattern = /^(\d{4})-(\d{4})$/;
      const match = yearNameControl.value.match(yearPattern);
      
      if (match) {
        const startYear = parseInt(match[1], 10);
        const endYear = parseInt(match[2], 10);
        
        const inputYear = inputDate.getFullYear();
        if (inputYear < startYear || inputYear > endYear) {
          return { dateNotInAcademicYear: true };
        }
      }
    }
    
    return null;
  }

  // Validation globale : La date de fin doit être après la date de début
  validateDates(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    const yearName = group.get('yearName')?.value;

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
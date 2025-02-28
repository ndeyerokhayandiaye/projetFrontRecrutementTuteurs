import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ResetPasswordService } from '../services/reset-password.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  currentStep: 'request' | 'confirm' | 'success' = 'request';
  isLoading = false;
  message = '';
  isError = false;

  // Request form
  requestEmail: string = '';
  verifEmail: string = '';

  // Confirm form
  otpCode: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  verifOtp: string = '';
  verifNewPassword: string = '';
  verifConfirmPassword: string = '';

  constructor(
    private resetPasswordService: ResetPasswordService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initialize component
  }

  // Validation methods
  validateEmail() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!this.requestEmail.trim()) {
      this.verifEmail = "L'email est requis.";
    } else if (!emailPattern.test(this.requestEmail)) {
      this.verifEmail = "Entrez une adresse e-mail valide.";
    } else {
      this.verifEmail = '';
    }
  }

  validateOtp() {
    if (!this.otpCode.trim()) {
      this.verifOtp = "Le code de réinitialisation est requis.";
    } else if (this.otpCode.length !== 6 || !/^\d+$/.test(this.otpCode)) {
      this.verifOtp = "Le code doit contenir 6 chiffres.";
    } else {
      this.verifOtp = '';
    }
  }

  validateNewPassword() {
    if (!this.newPassword.trim()) {
      this.verifNewPassword = "Le mot de passe est requis.";
    } else if (this.newPassword.length < 6) {
      this.verifNewPassword = "Le mot de passe doit contenir au moins 6 caractères.";
    } else {
      this.verifNewPassword = '';
    }
  }

  validateConfirmPassword() {
    if (!this.confirmPassword.trim()) {
      this.verifConfirmPassword = "La confirmation du mot de passe est requise.";
    } else if (this.confirmPassword !== this.newPassword) {
      this.verifConfirmPassword = "Les mots de passe ne correspondent pas.";
    } else {
      this.verifConfirmPassword = '';
    }
  }

  // Request password reset
  requestReset(): void {
    this.validateEmail();
    if (this.verifEmail) {
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.resetPasswordService.requestPasswordReset({ email: this.requestEmail }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message = response.message;
        this.isError = false;
        this.currentStep = 'confirm';
        this.Alert('Succès', 'Un code de réinitialisation a été envoyé à votre adresse email', 'success');
      },
      error: (error) => {
        this.isLoading = false;
        this.isError = true;
        this.message = error.error?.message || 'Une erreur est survenue lors de la demande de réinitialisation.';
        this.Alert('Erreur', this.message, 'error');
      }
    });
  }

  // Confirm password reset with OTP
  confirmReset(): void {
    this.validateOtp();
    this.validateNewPassword();
    this.validateConfirmPassword();

    if (this.verifOtp || this.verifNewPassword || this.verifConfirmPassword) {
      return;
    }

    this.isLoading = true;
    this.message = '';

    const payload = {
      email: this.requestEmail,
      otpCode: this.otpCode,
      newPassword: this.newPassword
    };

    this.resetPasswordService.confirmPasswordReset(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message = response.message;
        this.isError = false;
        this.currentStep = 'success';
        this.Alert('Succès', 'Mot de passe réinitialisé avec succès', 'success');
      },
      error: (error) => {
        this.isLoading = false;
        this.isError = true;
        this.message = error.error?.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.';
        this.Alert('Erreur', this.message, 'error');
      }
    });
  }

  // Go back to request OTP step
  goBackToRequestStep(): void {
    this.currentStep = 'request';
    this.message = '';
  }

  // Navigate to login page
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Show alert using SweetAlert
  Alert(title: string, text: string, icon: any) {
    Swal.fire({
      title,
      text,
      icon,
      timer: 1500
    });
  }
}
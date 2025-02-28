import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { RouterModule, Router } from '@angular/router';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})

export class RegisterComponent implements OnInit {

  user = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    profilePicture: '',
    role: "CANDIDATE"
  };

  confirmationPassword = '';
  verifNom: string = '';
  verifPrenom: string = '';
  verifEmail: string = '';
  verifPassword: string = '';
  verifConfirmationPassword: string = '';

  constructor(private loginService: LoginService, private router: Router) { }

  ngOnInit(): void {
    // code utilisé pour que Si L'utilisateur visite l'application pour la première fois et que certains paramètres doivent être sauvegardés dans localStorage...
    if (!localStorage.getItem("userConnect")) {
      localStorage.setItem('userConnect', JSON.stringify(""));
    }

  }
  // Validation nom
  validateNom() {
    const namePattern = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s-]{2,}$/;
    if (!this.user.lastName.trim()) {
      this.verifNom = "Le nom est requis.";
    } else if (!namePattern.test(this.user.lastName)) {
      this.verifNom = "Le nom doit contenir uniquement des lettres et au moins 2 caractères.";
    } else {
      this.verifNom = '';
    }
  }
  // Validation prenom
  validatePrenom() {
    const namePattern = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s-]{2,}$/;
    if (!this.user.firstName.trim()) {
      this.verifPrenom = "Le prénom est requis.";
    } else if (!namePattern.test(this.user.firstName)) {
      this.verifPrenom = "Le prénom doit contenir uniquement des lettres et au moins 2 caractères.";
    } else {
      this.verifPrenom = '';
    }
  }
  // Validation email
  validateEmail() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!this.user.email.trim()) {
      this.verifEmail = "L'email est requis.";
    } else if (!emailPattern.test(this.user.email)) {
      this.verifEmail = "Entrez une adresse e-mail valide.";
    } else {
      this.verifEmail = '';
    }
  }
  // Validation password
  validatePassword() {
    if (!this.user.password.trim()) {
      this.verifPassword = "Le mot de passe est requis.";
    } else if (this.user.password.length < 6) {
      this.verifPassword = "Le mot de passe doit contenir au moins 6 caractères.";
    } else {
      this.verifPassword = '';
    }
  }
  // Validation confirmation mot de passe
  validateConfirmationPassword() {
    if (!this.confirmationPassword.trim()) {
      this.verifConfirmationPassword = "Veuillez confirmer votre mot de passe.";
    } else if (this.confirmationPassword !== this.user.password) {
      this.verifConfirmationPassword = "Les mots de passe ne correspondent pas.";
    } else {
      this.verifConfirmationPassword = '';
    }
  }

  register() {
    // Vérifications des champs (reste inchangé)
    this.validateNom();
    this.validatePrenom();
    this.validateEmail();
    this.validatePassword();
    this.validateConfirmationPassword();

    if (this.verifNom || this.verifPrenom || this.verifEmail || this.verifPassword || this.verifConfirmationPassword) {
      this.Alert('Erreur', 'Veuillez remplir tous les champs correctement', 'warning');
      return;
    }

    // Appel du service d'inscription
    this.loginService.register(this.user).subscribe({
      next: (response) => {
        this.Alert("Inscription réussie👏🏽", "Vous êtes bien inscrit", "success");

        this.router.navigate(['/login']);

        // Réinitialiser les champs après inscription
        this.user = {
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          profilePicture: '',
          role: "CANDIDATE"
        };
        this.confirmationPassword = '';
      },
      error: (err) => {
        let errorMessage = 'Erreur lors de l\'inscription';

        // Tentative d'extraction du message d'erreur spécifique
        if (err.error) {
          try {
            // Si l'erreur est une chaîne JSON
            if (typeof err.error === 'string' && err.error.includes('errors=')) {
              const errorRegex = /errors=([^,]+)/;
              const match = err.error.match(errorRegex);
              if (match && match[1]) {
                errorMessage = match[1];
              }
            }
            // Si l'erreur est un objet avec une propriété 'errors'
            else if (err.error.errors) {
              errorMessage = err.error.errors;
            }
            // Si l'erreur est un objet avec un message
            else if (err.error.message) {
              errorMessage = err.error.message;
            }
          } catch (e) {
            console.error('Erreur lors du parsing du message d\'erreur', e);
          }
        }

        this.Alert('Erreur', errorMessage, 'warning');
        console.error('Erreur lors de l\'inscription', err);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.profilePicture = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  Alert(title: string, text: string, icon: any) {
    Swal.fire({
      title,
      text,
      icon,
      timer: 5000
    });
  }
}

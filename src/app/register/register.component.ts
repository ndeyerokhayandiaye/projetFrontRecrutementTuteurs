import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule
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

  constructor(private loginService: LoginService) {}

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
    // appel de toutes les fonctions pour les validations champs
    this.validateNom();
    this.validatePrenom();
    this.validateEmail();
    this.validatePassword();
    this.validateConfirmationPassword();

    if (this.verifNom || this.verifPrenom || this.verifEmail || this.verifPassword || this.verifConfirmationPassword || !this.user.profilePicture) {
      this.Alert('Erreur', 'Veuillez remplir tous les champs correctement', 'warning');
      return;
    }
// affichage des donnees au niveau de la console pour tester
    console.log('Données envoyées:', this.user);

 // Appeler le service d'inscription
    this.loginService.register(this.user).subscribe({
      next: (response) => {
        this.Alert("Inscription réussie👏🏽", "Vous êtes bien inscrit", "success");
  // Sauvegarde des informations de connexion dans le localStorage
        localStorage.setItem('email', this.user.email);
        localStorage.setItem('isLoggedIn', 'true');
  // Réinitialiser l'objet utilisateur après inscription réussie (vider les champs apres inscription)
        this.user = {
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          profilePicture: '',
          role: "CANDIDATE"
        };
        this.confirmationPassword = '';  // Réinitialiser le champ de confirmation de mot de passe puisse qu'il ne faisait pas partie de l'objet user
      },
      error: (err) => {
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
      timer: 1500
    });
  }
}

import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  user = {
    email: '',
    password: ''
  };

  verifEmail: string = '';
  verifPassword: string = '';

  constructor(private loginService: LoginService, private router: Router) {}

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

  login() {
      // appel de toutes les fonctions pour les validations champs
    this.validateEmail();
    this.validatePassword();

    if (this.verifEmail || this.verifPassword) {
      this.Alert('Erreur', 'Veuillez remplir tous les champs correctement.', 'warning');
      return;
    }
//  Appeler le service de connexion
    this.loginService.login(this.user).subscribe({
      next: (response) => {
        console.log('Connexion réussie', response);
        localStorage.setItem('authToken', response.token);
        this.Alert("Succès", "Connexion réussie !", "success");
        // redirider la page aprés la connexion
        this.router.navigate(['/accueil']);
      },
      error: (err) => {
        console.error('Erreur de connexion', err);
        this.Alert("Erreur", "Échec de la connexion. Vérifiez vos identifiants.", "error");
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

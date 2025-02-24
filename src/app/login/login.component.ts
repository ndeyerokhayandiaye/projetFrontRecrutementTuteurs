import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService } from '../services/login.service';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  credentials = {
    email: '',
    password: ''
  };

  verifEmail: string = '';
  verifPassword: string = '';

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {
    // Vérifier si l'email et le mot de passe sont stockés dans le localStorage
    const savedEmail = localStorage.getItem('email');
    const savedPassword = localStorage.getItem('password');

    if (savedEmail && savedPassword) {
      this.credentials.email = savedEmail;
      this.credentials.password = savedPassword;
    } else {
      this.credentials = { email: '', password: '' };
    }
  }

   // Validation email
  validateEmail() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!this. credentials.email.trim()) {
      this.verifEmail = "L'email est requis.";
    } else if (!emailPattern.test(this. credentials.email)) {
      this.verifEmail = "Entrez une adresse e-mail valide.";
    } else {
      this.verifEmail = '';
    }
  }
 // Validation password
  validatePassword() {
    if (!this. credentials.password.trim()) {
      this.verifPassword = "Le mot de passe est requis.";
    } else if (this. credentials.password.length < 6) {
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

    // Appeler le service de connexion
    this.loginService.login(this.credentials).subscribe({
      next: (response) => {
        this.Alert("Connexion réussie !", "Bienvenue sur la plateforme", "success");

        // Sauvegarde du rôle et des infos utilisateur
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('email', response.email);
        localStorage.setItem('role', response.role); // Stocke le rôle pour redirection
        // localStorage.setItem('authToken', response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.id); // Sauvegarde l'utilisateur dans localStorage

       
        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/accueil']);
        }

        // Après connexion réussie, supprimer les informations d'inscription pour ne pas les pré-remplir plus tard
        localStorage.removeItem('email');
        localStorage.removeItem('password');
      },
      error: (err) => {
        this.Alert('Erreur', 'Email ou mot de passe incorrect', 'error');
        console.error('Erreur de connexion', err);
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

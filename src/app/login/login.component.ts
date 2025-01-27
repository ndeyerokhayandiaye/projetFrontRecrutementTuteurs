import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';

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
    email: " ",
    password: " "
  };

  constructor(private loginService: LoginService, private router: Router) {}


  login() {
    this.loginService.login(this.user).subscribe({
      next: (response) => {
        console.log('Connexion réussie', response);
        localStorage.setItem('authToken', response.token);
        this.router.navigate(['/accueil']);  // Redirection vers accueil
      },
      error: (err) => {
        console.error('Erreur de connexion', err);
      }
    });
  }


}

import { Component } from '@angular/core';
import { LoginService } from '../services/login.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// import { AuthInterceptor } from '../intercepteur/intercepteur';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule
    // AuthInterceptor,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  user = {
    email: '',
    password: '',
    firstName : " ",
    lastName : " ",
    profilePicture: " ",
    role: "candidate "
    // role: " "
  };

  confirmationPassword = " ";

  constructor(private loginService: LoginService) {}


  register() {
    if (this.user.password !== this.confirmationPassword) {
      console.error('Les mots de passe ne correspondent pas.');
      return;
    }

    this.loginService.register(this.user).subscribe({
      next: response => {
        console.log('Inscription réussie', response);
      },
      error: err => {
        console.error('Erreur lors de l\'inscription', err);
      }
    });
  }


  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.profilePicture = e.target.result;  // Converti en base64
      };
      reader.readAsDataURL(file);
    }
  }



}

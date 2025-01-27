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
    role: "CANDIDATE "
  };

  confirmationPassword = " ";



  constructor(private loginService: LoginService) {}


  register() {
    // Vérifier que les mots de passe correspondent
    if (this.user.password !== this.confirmationPassword) {
      console.error('Les mots de passe ne correspondent pas.');
      return;
    }

    console.log('Données envoyées:', this.user);

    // Appeler le service d'inscription
    this.loginService.register(this.user).subscribe({
      next: (response) => {
        console.log('Inscription réussie', response);

        // Réinitialiser l'objet utilisateur après inscription réussie
        this.user = {
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          profilePicture: '',
           role: " "
        };
        this.confirmationPassword = '';  // Réinitialiser le champ de confirmation de mot de passe puisse qu'il ne faisait pas partie de l'objet user

      },
      error: (err) => {
        console.error('Erreur lors de l\'inscription', err);
      }
    });
  }




  // register() {
  //   if (this.user.password.length < 6) {
  //     console.error('Le mot de passe doit contenir au moins 6 caractères.');
  //     return;  // Empêche l'envoi si la condition n'est pas remplie
  //   }

  //   this.loginService.register(this.user).subscribe({
  //     next: response => {
  //       console.log('Inscription réussie', response);
  //     },
  //     error: err => {
  //       console.error('Erreur lors de l\'inscription', err);
  //     }
  //   });
  // }


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

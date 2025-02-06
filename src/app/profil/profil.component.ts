import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component , OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginService } from '../services/login.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
     HttpClientModule,
        FormsModule,
        CommonModule,
        RouterModule
  ],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss'
})
export class ProfilComponent implements OnInit{

  constructor(private profilService: LoginService) {}

  user = {
    email: '',
    firstName: '',
    lastName: '',
    profilePicture: '',
    role: ''
  };

  isEditing = false;


  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const userEmail = localStorage.getItem('userEmail'); // À adapter selon ton système d'authentification
    if (userEmail) {
      this.profilService.getUserByEmail(userEmail).subscribe({
        next: (data) => {
          this.user = data;
        },
        error: (err) => console.error('Erreur lors du chargement du profil', err)
      });
    }
  }

  updateProfile() {
    this.profilService.updateUser(this.user.email, this.user).subscribe({
      next: (response) => {
        console.log('Profil mis à jour avec succès', response);
        this.isEditing = false;
      },
      error: (err) => console.error('Erreur lors de la mise à jour', err)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.profilePicture = e.target.result; // Converti en base64
      };
      reader.readAsDataURL(file);
    }
  }

  enableEditing() {
    this.isEditing = true;
  }

}

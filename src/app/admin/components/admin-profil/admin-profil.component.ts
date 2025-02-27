import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { ProfileService } from '../../../services/profile.service';
import { baseUrl } from '../../../services/url';


@Component({
  selector: 'app-admin-profil',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    RouterModule,
    

  ],
  templateUrl: './admin-profil.component.html',
  styleUrl: './admin-profil.component.scss'
})

export class AdminProfilComponent implements OnInit {

  constructor(
    private profileService: ProfileService
  ) { }

  user = {
    email: '',
    firstName: '',
    lastName: '',
    profilePicture: '',
    role: ''
  };

  originalUser = {
    profilePicture: ''
  };

  newProfilePicture: boolean = false;
  isEditing = false;
  isLoading = true;
  // Référence au modal
  private detailsModal: any;


  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.isLoading = true;
    this.profileService.getUserProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.user.profilePicture = this.user.profilePicture ? `${baseUrl}/files/images/${this.user.profilePicture}` : '/assets/images/avatar.png';
        // Sauvegarde de l'URL originale de l'image
        this.originalUser.profilePicture = this.user.profilePicture;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil', err);
        this.isLoading = false;
        Swal.fire('Erreur', 'Impossible de charger votre profil.', 'error');
      }
    });
  }

  updateProfile() {
    this.isLoading = true;

    // Créer une copie des données à envoyer
    const userData = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      role: this.user.role
    };

    // Ajouter la photo de profil uniquement si elle a été modifiée
    if (this.newProfilePicture) {
      // @ts-ignore
      userData.profilePicture = this.user.profilePicture;
    }

    this.profileService.updateUserProfile(userData).subscribe({
      next: (response) => {
        // Mettre à jour le localStorage avec les nouvelles informations
        const userConnect = JSON.parse(localStorage.getItem('userConnect') || '{}');

        // Mettre à jour les propriétés existantes
        userConnect.firstName = this.user.firstName;
        userConnect.lastName = this.user.lastName;
        userConnect.email = this.user.email;

        // Si la photo de profil a été mise à jour et est présente dans la réponse
        if (response.profilePicture) {
          userConnect.profilePicture = response.profilePicture;
        }

        // Sauvegarder les changements dans le localStorage
        localStorage.setItem('userConnect', JSON.stringify(userConnect));

        // Notifier les autres composants que le profil a été mis à jour
        this.profileService.notifyProfileUpdate();

        this.isLoading = false;
        this.isEditing = false;
        this.newProfilePicture = false;
        Swal.fire('Succès', 'Profil mis à jour avec succès', 'success');
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour', err);
        this.isLoading = false;
        Swal.fire('Erreur', 'La mise à jour du profil a échoué.', 'error');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.profilePicture = e.target.result;
        this.newProfilePicture = true;
      };
      reader.readAsDataURL(file);
    }
  }

  enableEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
    // Restaurer l'image originale
    this.user.profilePicture = this.originalUser.profilePicture;
    this.newProfilePicture = false;
    this.loadUserProfile();
  }

}
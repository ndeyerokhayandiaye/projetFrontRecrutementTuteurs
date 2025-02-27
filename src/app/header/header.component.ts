import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { baseUrl } from '../services/url';
import { LoginService } from '../services/login.service';
import { Subscription } from 'rxjs';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,
    RouterModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  userAvatar: string = '/assets/images/avatar.png';
  private apiBaseUrl: string = `${baseUrl}/files/images/`;
  showDropdown: boolean = false;
  private profileSubscription!: Subscription;

  constructor(
    private loginService: LoginService,
    private profileService: ProfileService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    // Fermer le dropdown quand on clique ailleurs sur la page
    this.renderer.listen('window', 'click', (e: Event) => {
      if (!this.el.nativeElement.contains(e.target)) {
        this.showDropdown = false;
      }
    });
  }

  ngOnInit(): void {
    // Vérifier si l'utilisateur est connecté lors du chargement du composant
    this.checkLoginStatus();

    // S'abonner aux mises à jour du profil
    this.profileSubscription = this.profileService.profileUpdated$.subscribe(() => {
      this.checkLoginStatus();
    });
  }

  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites de mémoire
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }


  checkLoginStatus(): void {
    this.isLoggedIn = this.loginService.isLoggedIn();

    if (this.isLoggedIn) {
      try {
        const userConnect = JSON.parse(localStorage.getItem('userConnect') || '{}');

        // Vérifier à la fois picture et profilePicture
        if (userConnect && (userConnect.profilePicture || userConnect.picture)) {
          this.userAvatar = `${this.apiBaseUrl}${userConnect.profilePicture || userConnect.picture}`;
        } else {
          this.userAvatar = '/assets/images/avatar.png';
        }
      } catch (error) {
        console.error('Erreur:', error);
        this.userAvatar = '/assets/images/avatar.png';
      }
    }
  }

  // Méthode pour gérer l'erreur de chargement d'image
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/images/avatar.png';
  }

  // Méthode pour se déconnecter
  logout(): void {
    this.loginService.logout();
    this.isLoggedIn = false;
    this.userAvatar = '/assets/images/avatar.png';
    window.location.href = '/accueil';
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }


}
import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { baseUrl } from '../services/url';
import { LoginService } from '../services/login.service';

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
  userAvatar: string = '/assets/images/annonce-1.png';
  private apiBaseUrl: string = `${baseUrl}/files/images/`;
  showDropdown: boolean = false;

  // constructor(private loginService: LoginService) { }
  constructor(
    private loginService: LoginService,
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

    // Écouter les changements dans localStorage (optionnel)
    window.addEventListener('storage', () => {
      this.checkLoginStatus();
    });
  }


  checkLoginStatus(): void {
    this.isLoggedIn = this.loginService.isLoggedIn();

    if (this.isLoggedIn) {
      try {
        const userConnect = JSON.parse(localStorage.getItem('userConnect') || '{}');

        if (userConnect && userConnect.picture) {
          this.userAvatar = `${this.apiBaseUrl}${userConnect.picture}`;
        }
      } catch (error) {
        console.error('Erreur:', error);
        this.userAvatar = '/assets/images/annonce-1.png';
      }
    }
  }

  // Méthode pour gérer l'erreur de chargement d'image
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/images/annonce-1.png';
  }

  // Méthode pour se déconnecter
  logout(): void {
    this.loginService.logout();
    this.isLoggedIn = false;
    this.userAvatar = '/assets/images/annonce-1.png';
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }
}
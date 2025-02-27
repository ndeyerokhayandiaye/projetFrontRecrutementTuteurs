// import { CommonModule } from '@angular/common';
// import { Component, EventEmitter, Output } from '@angular/core';
// import { RouterModule } from '@angular/router';
// import { SidebarService } from '../../../services/sidebar-service.service';

// @Component({
//   selector: 'app-navbar',
//   standalone: true,
//   imports: [ CommonModule,
//        RouterModule,],
//   templateUrl: './navbar.component.html',
//   styleUrl: './navbar.component.scss'
// })
// export class NavbarComponent {
//   constructor(private sidebarService: SidebarService) {}

//   toggleSidebar() {
//     this.sidebarService.toggleSidebar();
//   }
// }

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { baseUrl } from '../../../services/url';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<void>();
  
  userAvatar: string = '/assets/images/avatar.png';
  private apiBaseUrl: string = `${baseUrl}/files/images/`;
  
  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    try {
      const userConnect = JSON.parse(localStorage.getItem('userConnect') || '{}');
      
      // Vérifier si l'image de profil existe
      if (userConnect && (userConnect.profilePicture || userConnect.picture)) {
        this.userAvatar = `${this.apiBaseUrl}${userConnect.profilePicture || userConnect.picture}`;
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/images/avatar.png';
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }
}
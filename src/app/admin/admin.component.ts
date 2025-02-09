import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule,
    SidebarComponent,
    RouterModule,
    NavbarComponent
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

  isSidebarHidden = window.innerWidth <= 768; // Caché par défaut sur mobile

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isSidebarHidden = event.target.innerWidth <= 768;
  }

  toggleSidebar() {
    setTimeout(() => {
      this.isSidebarHidden = !this.isSidebarHidden;
    }, 50); // Petit délai pour éviter un bug d'affichage
  }




}

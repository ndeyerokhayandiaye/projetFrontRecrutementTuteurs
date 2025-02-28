import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginService } from '../../../services/login.service';
import { SidebarService } from '../../../services/sidebar-service.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})

export class SidebarComponent implements OnInit {
  @Input() isHidden = false;
  isSuperAdmin = false;
  currentUserEmail = '';

  constructor(
    private loginService: LoginService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit() {
    this.sidebarService.sidebarVisible$.subscribe(
      visible => this.isHidden = !visible
    );
    
    // Récupérer les informations de l'utilisateur connecté
    const userConnect = localStorage.getItem('userConnect');
    if (userConnect) {
      const user = JSON.parse(userConnect);
      this.currentUserEmail = user.email || '';
      this.isSuperAdmin = this.currentUserEmail === 'admin@admin.com';
    }
  }

  logout() {
    this.loginService.logout();
  }
}
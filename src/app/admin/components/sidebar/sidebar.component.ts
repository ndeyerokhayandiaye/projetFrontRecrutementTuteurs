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

export class SidebarComponent  {
  @Input() isHidden = false;

  constructor(
    private loginService: LoginService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit() {
    this.sidebarService.sidebarVisible$.subscribe(
      visible => this.isHidden = !visible
    );
  }

  logout() {
    this.loginService.logout();
  }
}
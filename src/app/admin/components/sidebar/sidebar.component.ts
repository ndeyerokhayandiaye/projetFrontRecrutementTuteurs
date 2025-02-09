import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

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
export class SidebarComponent {

  // toggleSidebar() {
  //   const sidebar = document.querySelector('.sidebar');
  //   if (sidebar) {
  //     sidebar.classList.toggle('open');
  //   }
  // }

}

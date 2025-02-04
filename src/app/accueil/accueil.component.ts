import { Component } from '@angular/core';
// import { HeaderComponent } from '../header/header.component';
// import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { LoginComponent } from '../login/login.component';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule,
    HeaderComponent,
    LoginComponent,
    RouterModule
  ],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.scss'
})
export class AccueilComponent {

}

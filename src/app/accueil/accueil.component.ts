import { Component } from '@angular/core';
// import { HeaderComponent } from '../header/header.component';
// import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';


@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule,
    HeaderComponent
  ],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.scss'
})
export class AccueilComponent {

}

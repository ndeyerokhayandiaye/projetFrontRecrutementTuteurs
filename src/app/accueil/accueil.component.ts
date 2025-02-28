import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { LoginComponent } from '../login/login.component';
import { RouterModule } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { FooterComponent } from '../footer/footer.component';
import { AnnonceService } from '../services/annonce.service';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule,
    HeaderComponent,
    LoginComponent,
    FooterComponent,
    RouterModule
  ],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.scss'
})
export class AccueilComponent implements OnInit, AfterViewInit {
  annonces: any[] = [];
  annoncesDisponibles = false;
  
  constructor(private annonceService: AnnonceService) {}
  
  ngOnInit(): void {
    // Initialiser le carousel
    setTimeout(() => {
      const carouselElement = document.getElementById('header-carousel');
      if (carouselElement) {
        const carousel = new bootstrap.Carousel(carouselElement, {
          interval: 3000,
          ride: 'carousel',
          wrap: true
        });
        
        carousel.cycle();
      }
    }, 100);

    // Initialiser les animations de défilement
    this.initScrollAnimations();
    
    // Charger les annonces
    this.loadAnnonces();
  }

  ngAfterViewInit(): void {
  }
  
  // Méthode pour charger les annonces depuis le service
  loadAnnonces() {
    this.annonceService.getAnnonces().subscribe({
      next: (data) => {
        // Filtrer uniquement les annonces avec status "PUBLISHED"
        const annoncesPubliees = data.filter(annonce => annonce.status === 'PUBLISHED');
        
        // Vérifier si des annonces sont disponibles
        this.annoncesDisponibles = annoncesPubliees.length > 0;
        
        // Limiter à 3 annonces pour la page d'accueil
        this.annonces = annoncesPubliees.slice(0, 3);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des annonces', error);
        this.annoncesDisponibles = false;
      }
    });
  }

  private initScrollAnimations(): void {
    // Observer pour détecter quand les éléments entrent dans la vue
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Si l'élément est visible
        if (entry.isIntersecting) {
          const animationClass = (entry.target as HTMLElement).dataset['animation'];
          const animationDelay = (entry.target as HTMLElement).dataset['animationDelay'];

          if (animationClass) {
            (entry.target as HTMLElement).classList.add('animate__animated', animationClass);

            // Ajouter un délai si spécifié
            if (animationDelay) {
              (entry.target as HTMLElement).style.animationDelay = `${parseInt(animationDelay) / 1000}s`;
            }
          }

          // Ne plus observer cet élément après l'animation
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 }); // Déclencher quand au moins 10% de l'élément est visible

    // Observer tous les éléments avec l'attribut data-animation
    document.querySelectorAll('[data-animation]').forEach(element => {
      observer.observe(element);
    });
  }
}
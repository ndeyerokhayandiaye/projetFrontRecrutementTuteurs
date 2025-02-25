import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { LoginComponent } from '../login/login.component';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule,
    HeaderComponent,
    LoginComponent,
    FooterComponent,
    RouterModule
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit, AfterViewInit {
  // Index du témoignage courant
  private currentTestimonialIndex = 0;
  private testimonials: HTMLElement[] = [];

  ngOnInit(): void {
    // Animation des compteurs
    this.initCounters();

    // Initialiser les animations de défilement
    this.initScrollAnimations();
  }

  ngAfterViewInit(): void {
    // Initialiser un carousel simple sans jQuery
    this.initSimpleCarousel();
  }

  private initSimpleCarousel(): void {
    // Récupérer tous les témoignages
    this.testimonials = Array.from(document.querySelectorAll('.testimonial-item')) as HTMLElement[];

    if (this.testimonials.length > 0) {
      // Cacher tous les témoignages sauf le premier
      this.testimonials.forEach((testimonial, index) => {
        if (index !== 0) {
          testimonial.style.display = 'none';
        }
      });

      // Rotation automatique des témoignages
      setInterval(() => {
        this.showNextTestimonial();
      }, 5000);
    }
  }

  private showNextTestimonial(): void {
    // Cacher le témoignage courant
    if (this.testimonials[this.currentTestimonialIndex]) {
      this.testimonials[this.currentTestimonialIndex].style.display = 'none';
    }

    // Incrémenter l'index et boucler si nécessaire
    this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % this.testimonials.length;

    // Afficher le prochain témoignage
    if (this.testimonials[this.currentTestimonialIndex]) {
      this.testimonials[this.currentTestimonialIndex].style.display = 'block';
    }
  }

  private initCounters(): void {
    const counters = document.querySelectorAll('[data-toggle="counter-up"]');
    if (counters) {
      counters.forEach(counter => {
        const updateCount = () => {
          const target = +(counter.getAttribute('data-target') || counter.innerHTML);
          const count = +counter.innerHTML;
          const increment = target / 200;

          if (count < target) {
            counter.innerHTML = Math.ceil(count + increment).toString();
            setTimeout(updateCount, 1);
          } else {
            counter.innerHTML = target.toString();
          }
        };

        counter.innerHTML = '0';
        updateCount();
      });
    }
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
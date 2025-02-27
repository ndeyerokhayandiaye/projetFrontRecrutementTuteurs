import { Routes } from '@angular/router';
import { AccueilComponent } from './accueil/accueil.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AnnonceComponent } from './annonce/annonce.component';
import { ProfilComponent } from './profil/profil.component';
import { allGuardGuard } from './guards/all-guard.guard';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { AboutComponent } from './about/about.component';

export const routes: Routes = [
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },
  { path: 'accueil', component: AccueilComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'annonce', component: AnnonceComponent },
  { path: 'about', component: AboutComponent },

  { path: 'profil', component: ProfilComponent, canActivate: [allGuardGuard] }, // Protégé par le guard

  // Routes admin
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes), // Charge les routes enfants
    canActivate: [allGuardGuard], // Protège toutes les routes admin
    data: { requiredRole: 'ADMIN' } // Seuls les ADMIN peuvent accéder
  },

  // Route pour les pages non trouvées
  { path: '**', component: MaintenanceComponent }
];

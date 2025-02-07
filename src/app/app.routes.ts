import { Routes } from '@angular/router';
import { AccueilComponent } from './accueil/accueil.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AnnonceComponent } from './annonce/annonce.component';
import { ProfilComponent } from './profil/profil.component';
import { AdminComponent } from './admin/admin.component';
import { adminRoutes } from './admin/admin.routes';

export const routes: Routes = [
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },
  { path: 'accueil', component: AccueilComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'annonce', component: AnnonceComponent },
  { path: 'profil', component: ProfilComponent},




    { path: 'admin', children: adminRoutes },
    { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes) },


];

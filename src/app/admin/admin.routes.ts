import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AnnonceListComponent } from './components/annonce-list/annonce-list.component';
import { AnnonceFormComponent } from './components/annonce-form/annonce-form.component';
import { CandidatsListComponent } from './components/candidats-list/candidats-list.component';
import { AnneeAcademiqueListComponent } from './components/annee-academique-list/annee-academique-list.component';
import { AnneeAcademiqueFormulaireComponent } from './components/annee-academique-formulaire/annee-academique-formulaire.component';
import { AdminProfilComponent } from './components/admin-profil/admin-profil.component';
import { ManageAdminComponent } from './components/manage-admin/manage-admin.component';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { ManageCandidatesComponent } from './components/manage-candidates/manage-candidates.component';
import { AdminGuard } from '../guards/admin-guard.guard';

export const adminRoutes: Routes = [
  {
    path: '', component: AdminComponent, children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Redirige /admin vers /admin/dashboard
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'annonces', component: AnnonceListComponent },
      { path: 'annonces/nouvelle', component: AnnonceFormComponent },
      { path: 'admin-profil', component: AdminProfilComponent },
      { path: 'candidats', component: CandidatsListComponent },
      { path: 'annees-academiques', component: AnneeAcademiqueListComponent },
      { path: 'annees-academiques/nouvelle', component: AnneeAcademiqueFormulaireComponent },
      { path: 'manage-admins', component: ManageAdminComponent, canActivate: [SuperAdminGuard] },
      { path: 'manage-candidats', component: ManageCandidatesComponent, canActivate: [AdminGuard] }
    ]
  }
];

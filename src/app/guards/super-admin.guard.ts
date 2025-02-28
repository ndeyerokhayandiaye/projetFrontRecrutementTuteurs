import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminGuard implements CanActivate {
  
  constructor(private router: Router) {}
  
  canActivate(): boolean {
    // Récupérer les informations de l'utilisateur connecté
    const userConnect = localStorage.getItem('userConnect');
    if (userConnect) {
      const user = JSON.parse(userConnect);
      if (user.email === 'admin@admin.com') {
        return true; // Autoriser l'accès
      }
    }
    
    // Rediriger vers le dashboard si l'utilisateur n'est pas le super admin
    this.router.navigate(['/admin/dashboard']);
    return false;
  }
}
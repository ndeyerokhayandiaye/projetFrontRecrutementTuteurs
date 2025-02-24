import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import Swal from 'sweetalert2';

export const allGuardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Vérifie si l'utilisateur est connecté (token existe dans le localStorage)
  const token = localStorage.getItem('token');
  if (!token) {
    Swal.fire({
      icon: 'error',
      title: 'Oops',
      text: 'Connectez-vous pour accéder à cet espace.',
      confirmButtonColor: '#1E1E1E',
      timer: 1500
    });
    router.navigate(['/accueil']);
    return false;
  }

  // Vérifie si l'utilisateur a le rôle requis pour accéder à la route
  const userRole = localStorage.getItem('role');
  const requiredRole = route.data?.['requiredRole']; // Rôle requis pour la route

  if (requiredRole && userRole !== requiredRole) {
    Swal.fire({
      icon: 'error',
      title: 'Accès refusé',
      text: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.',
      confirmButtonColor: '#1E1E1E',
    });
    router.navigate(['/accueil']);
    return false;
  }
  // Si l'utilisateur est connecté et a le rôle requis, autorise l'accès
  return true;
};

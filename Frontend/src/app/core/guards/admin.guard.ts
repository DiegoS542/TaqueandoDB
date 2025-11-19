// src/app/core/guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Revisa si el rol del token es 'admin'
  if (authService.getUserRole() === 'admin') {
    return true; // Sí puede pasar
  }

  // Si no es admin, lo redirige al dashboard
  console.warn('Acceso denegado: Se requiere rol de "admin".');
  router.navigate(['/app/dashboard']);
  return false; // No puede pasar
};
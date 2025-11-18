import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el servicio dice que el usuario está autenticado, déjalo pasar
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no, envíalo a la página de login
  router.navigate(['/login']);
  return false;
};
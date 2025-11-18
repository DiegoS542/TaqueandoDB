import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // --- RUTAS PÚBLICAS ---
  { 
    path: 'login', 
    loadComponent: () => import('./authModule/login/login.component').then(m => m.LoginComponent) 
  },

  // --- RUTAS PRIVADAS (Protegidas) ---
  {
    path: 'app',
    loadComponent: () => import('./core/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard], // ...debe pasar el guardián de autenticación
    children: [
      // Aquí irán las rutas hijas (dashboard, ventas, etc.)
      { 
        path: 'dashboard', 
        loadComponent: () => import('./dashboardModule/dashboard/dashboard.component').then(m => m.DashboardComponent) 
      },
      // Redirección por defecto dentro de 'app'
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // --- REDIRECCIONES ---
  // Si no pones nada en la URL, te manda a la app (que el guardián revisará)
  { path: '', redirectTo: 'app', pathMatch: 'full' }, 
  
  // Cualquier otra URL no encontrada, te manda a la app
  { path: '**', redirectTo: 'app' }
];

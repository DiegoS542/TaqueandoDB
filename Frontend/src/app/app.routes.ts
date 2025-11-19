import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

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
      // Rutas Hijas
      { 
        path: 'dashboard', 
        loadComponent: () => import('./dashboardModule/dashboard/dashboard.component').then(m => m.DashboardComponent) 
      },
      { 
        path: 'ventas', 
        loadComponent: () => import('./ventasModule/ventas/ventas.component').then(m => m.VentasComponent) 
      },
      { 
        path: 'inventario', 
        loadComponent: () => import('./inventarioModule/inventario/inventario.component').then(m => m.InventarioComponent) 
      },
      { 
        path: 'pedidos', 
        loadComponent: () => import('./pedidosModule/pedidos/pedidos.component').then(m => m.PedidosComponent) 
      },
      // Rutas de Admin (protegidas por el adminGuard)
      { 
        path: 'admin/usuarios', 
        loadComponent: () => import('./adminModule/gestion-usuarios/gestion-usuarios.component').then(m => m.GestionUsuariosComponent),
        canActivate: [adminGuard]
      },
      { 
        path: 'admin/productos', 
        loadComponent: () => import('./adminModule/gestion-productos/gestion-productos.component').then(m => m.GestionProductosComponent),
        canActivate: [adminGuard]
      },
      { 
        path: 'admin/insumos', 
        loadComponent: () => import('./adminModule/gestion-insumos/gestion-insumos.component').then(m => m.GestionInsumosComponent),
        canActivate: [adminGuard]
      },
      { 
        path: 'admin/proveedores', 
        loadComponent: () => import('./adminModule/gestion-proveedores/gestion-proveedores.component').then(m => m.GestionProveedoresComponent),
        canActivate: [adminGuard]
      },
      { 
        path: 'admin/sucursales', 
        loadComponent: () => import('./adminModule/gestion-sucursales/gestion-sucursales.component').then(m => m.GestionSucursalesComponent),
        canActivate: [adminGuard]
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

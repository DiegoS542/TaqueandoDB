import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; // Importar
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  // Exponemos el rol para usarlo en el HTML
  userRole: 'admin' | 'operaciones' | 'gerente' | null;

  constructor(private authService: AuthService) { 
    this.userRole = this.authService.getUserRole();
  }

  logout() {
    this.authService.logout();
  }
}

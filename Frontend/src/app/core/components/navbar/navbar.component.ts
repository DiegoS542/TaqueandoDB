import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../shared/models/usuario.model';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  // Almacena el objeto Usuario completo
  public usuario: Usuario | null = null;

  constructor(private authService: AuthService) {
    // Pide el objeto de usuario al servicio
    this.usuario = this.authService.getCurrentUser();
    console.log('Usuario en el navbar:', this.usuario);
  }

  logout() {
    this.authService.logout();
  }
}

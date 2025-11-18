import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Usuario } from '../../../shared/models/usuario.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidenav',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent {

  // Almacena el objeto Usuario completo
  public usuario: Usuario | null = null;

  constructor(private authService: AuthService) {
    // Pide el objeto de usuario al servicio
    this.usuario = this.authService.getCurrentUser();
  }
}

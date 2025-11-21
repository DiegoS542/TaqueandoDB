import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Sucursal } from '../../shared/models/sucursal.model';
import { UsuariosService } from '../services/usuarios.service';
import { SucursalesService } from '../services/sucursales.service';
import { UsuariosListComponent } from './components/usuarios-list/usuarios-list.component';
import { UsuariosFormComponent } from './components/usuarios-form/usuarios-form.component';

@Component({
  selector: 'app-gestion-usuarios',
  imports: [CommonModule, UsuariosListComponent, UsuariosFormComponent],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.css'
})
export class GestionUsuariosComponent {
  
  usuarios: any[] = [];
  sucursales: Sucursal[] = [];
  
  isLoading: boolean = true;
  showModal: boolean = false;
  usuarioToEdit: any | null = null; // Para pasar al hijo

  constructor(
    private usuariosService: UsuariosService,
    private sucursalesService: SucursalesService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });

    // Cargar sucursales una vez
    if (this.sucursales.length === 0) {
      this.sucursalesService.getSucursales().subscribe(data => this.sucursales = data);
    }
  }

  // --- MANEJO DE EVENTOS DEL HIJO (LISTA) ---

  handleEdit(usuario: any) {
    this.usuarioToEdit = usuario;
    this.showModal = true;
  }

  handleDelete(id: number) {
    if (confirm('¿Eliminar usuario?')) {
      this.usuariosService.deleteUsuario(id).subscribe(() => this.loadData());
    }
  }

  // --- MANEJO DE EVENTOS DEL HIJO (FORMULARIO) ---

  handleSave(formData: any) {
    if (this.usuarioToEdit) {
      // Editar
      this.usuariosService.updateUsuario(this.usuarioToEdit.usuario_id, formData).subscribe(() => {
        this.closeModal();
        this.loadData();
      });
    } else {
      // Crear
      this.usuariosService.createUsuario(formData).subscribe(() => {
        this.closeModal();
        this.loadData();
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.usuarioToEdit = null;
  }
}
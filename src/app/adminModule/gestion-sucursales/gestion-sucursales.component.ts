import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Sucursal } from '../../shared/models/sucursal.model';
import { SucursalesService } from '../services/sucursales.service';

@Component({
  selector: 'app-gestion-sucursales',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestion-sucursales.component.html',
  styleUrl: './gestion-sucursales.component.css'
})
export class GestionSucursalesComponent {
  sucursales: Sucursal[] = [];
  sucursalForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  currentId: number | null = null;
  isLoading: boolean = true;

  constructor(
    private sucursalesService: SucursalesService,
    private fb: FormBuilder
  ) {
    this.sucursalForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.loadSucursales();
  }

  loadSucursales() {
    this.isLoading = true;
    this.sucursalesService.getSucursales().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  openModal(sucursal?: Sucursal) {
    this.showModal = true;
    if (sucursal) {
      // Modo Edición
      this.isEditing = true;
      this.currentId = sucursal.sucursal_id!;
      this.sucursalForm.patchValue({ nombre: sucursal.nombre });
    } else {
      // Modo Creación
      this.isEditing = false;
      this.currentId = null;
      this.sucursalForm.reset();
    }
  }

  closeModal() {
    this.showModal = false;
  }

  onSubmit() {
    if (this.sucursalForm.invalid) return;

    const sucursalData: Sucursal = this.sucursalForm.value;

    if (this.isEditing && this.currentId) {
      this.sucursalesService.updateSucursal(this.currentId, sucursalData).subscribe(() => {
        this.loadSucursales();
        this.closeModal();
      });
    } else {
      this.sucursalesService.createSucursal(sucursalData).subscribe(() => {
        this.loadSucursales();
        this.closeModal();
      });
    }
  }

  deleteSucursal(id: number) {
    if (confirm('¿Estás seguro de eliminar esta sucursal?')) {
      this.sucursalesService.deleteSucursal(id).subscribe({
        next: () => this.loadSucursales(),
        error: (err) => alert('No se puede eliminar: Tiene datos asociados.')
      });
    }
  }
}

// inventario.component.ts

import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TablaInventarioComponent } from '../../core/components/tabla-inventario/tabla-inventario.component';
import { InventarioService } from '../services/inventario.service';
import { Producto } from '../../shared/models/producto.model';

// ... (Resto de imports) ...

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TablaInventarioComponent],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
})
export class InventarioComponent implements OnInit {
  productosInventario: Producto[] = [];
  isLoading: boolean = true;

  showModal: boolean = false;
  isEditing: boolean = false;
  itemIdToEdit: string | null = null;
  itemForm: FormGroup;
  token: string | null = localStorage.getItem('authToken');
  consoleLogToken: void = console.log('Token de autenticación:', this.token);

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService
  ) {
    this.itemForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      tipo: ['P', Validators.required],
      insumoPrincipal: [''],
      stockActual: [0, [Validators.required, Validators.min(0)]],
      unidad: ['', Validators.required],
      sucursalId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.isLoading = true;

    // Usa this.token en la llamada al servicio
    this.inventarioService.listarInventario(this.token).subscribe({
      next: (response) => {
        this.productosInventario = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar el inventario:', err);
        this.isLoading = false;
      },
    });
  }

  // ... (openModal y cancel) ...

  submit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const formValues = this.itemForm.value;
    const itemData: Producto = {
      // Aseguramos que sucursalId exista si lo necesitamos
      // id: this.itemIdToEdit, // Si tu modelo Producto no tiene id, no lo incluyas aquí.
      codigo: formValues.codigo,
      nombre: formValues.nombre,
      insumoPrincipal:
        formValues.tipo === 'I' ? 'N/A' : formValues.insumoPrincipal,
      stockActual: formValues.stockActual,
      unidad: formValues.unidad,
      sucursalId: formValues.sucursalId,
      ultimaActualizacion: new Date(),
    };

    if (this.isEditing && this.itemIdToEdit) {
      // LLAMADA PUT (Actualizar) - Usa this.token
      this.inventarioService.actualizarItem(itemData, this.token).subscribe({
        next: () => {
          this.cancel();
          this.cargarDatos();
        },
        error: (err) => console.error('Error al actualizar:', err),
      });
    } else {
      // LLAMADA POST (Crear) - Usa this.token
      this.inventarioService.crearItem(itemData, this.token).subscribe({
        next: () => {
          this.cancel();
          this.cargarDatos();
        },
        error: (err) => console.error('Error al crear:', err),
      });
    }
  }

  editItem(producto: Producto): void {
    this.openModal(true, producto);
  }

  eliminarItem(producto: Producto): void {
    if (!producto.codigo) {
      console.error('No se puede eliminar: Código faltante.');
      return;
    }

    const confirmar = confirm(
      `¿Estás seguro de que deseas eliminar el ítem "${producto.nombre}"? Esta acción es irreversible.`
    );
    if (confirmar) {
      // LLAMADA DELETE (Eliminar) - Usa this.token
      this.inventarioService
        .eliminarItem(producto.codigo, this.token)
        .subscribe({
          next: () => {
            console.log(`Ítem ${producto.codigo} eliminado con éxito.`);
            this.cargarDatos();
          },
          error: (err) => {
            console.error('Error al eliminar el ítem:', err);
            alert('No se pudo eliminar el ítem. Verifique las dependencias.');
          },
        });
    }
  }

  openModal(isEditing: boolean, producto?: Producto): void {
    // Lógica para abrir y precargar el formulario
    this.isEditing = isEditing;
    this.showModal = true;
    this.itemForm.reset();

    if (isEditing && producto) {
      this.itemIdToEdit = producto.codigo || null;
      this.itemForm.patchValue({
        codigo: producto.codigo,
        nombre: producto.nombre,
        tipo: producto.codigo.startsWith('P') ? 'P' : 'I',
        insumoPrincipal: producto.insumoPrincipal,
        stockActual: producto.stockActual,
        unidad: producto.unidad,
        sucursalId: producto.sucursalId,
      });
    } else {
      this.itemIdToEdit = null;
      this.itemForm.patchValue({ tipo: 'P', stockActual: 0, sucursalId: null });
    }
  }

  cancel(): void {
    this.showModal = false;
    this.itemIdToEdit = null;
    this.itemForm.reset();
  }
}

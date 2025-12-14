import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TablaInventarioComponent } from '../../core/components/tabla-inventario/tabla-inventario.component';
// Asumo que tu interfaz Producto es esta, definida en '../../shared/models/producto.model'
import { Producto } from '../../shared/models/producto.model';

// 1. Interfaz extendida para el Contexto del Inventario (UI y Backend)
// Usamos esto para el array principal y el formulario, ya que la gestión requiere ID y Sucursal

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TablaInventarioComponent],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css',
})
export class InventarioComponent implements OnInit {
  // Usamos la interfaz extendida para el array principal
  productosInventario: Producto[] = [];
  isLoading: boolean = true;

  // --- Propiedades del Modal ---
  showModal: boolean = false;
  isEditing: boolean = false;
  itemIdToEdit: string | null = null;
  itemForm: FormGroup;

  constructor(private fb: FormBuilder) {
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
    this.cargarDatosEjemplo();
  }

  cargarDatosEjemplo(): void {
    this.isLoading = true;
    setTimeout(() => {
      const ahora = new Date();

      this.productosInventario = [
        {
          codigo: 'P001',
          nombre: 'Taco de Pastor',
          insumoPrincipal: 'Carne de cerdo (Pastor)',
          stockActual: 500,
          unidad: 'Und',
          sucursalId: 1,
          ultimaActualizacion: new Date(ahora.getTime() - 60 * 60 * 1000),
        },
        {
          codigo: 'I005',
          nombre: 'Tortillas de Maíz',
          insumoPrincipal: 'Maíz',
          stockActual: 25,
          unidad: 'Kg',
          sucursalId: 2,
          ultimaActualizacion: new Date(ahora.getTime() - 30 * 60 * 1000),
        },
      ];
      this.isLoading = false;
    }, 500);
  }

  // --- MÉTODOS DEL MODAL (CRUD UI) ---

  // Usamos InventarioItem en la definición para asegurar que tenemos ID
  openModal(isEditing: boolean, producto?: Producto): void {
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

  submit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const formValues = this.itemForm.value;

    const itemData: Producto = {
      codigo: formValues.codigo,
      nombre: formValues.nombre,
      insumoPrincipal:
        formValues.tipo === 'I' ? 'N/A' : formValues.insumoPrincipal,
      stockActual: formValues.stockActual,
      unidad: formValues.unidad,
      sucursalId: formValues.sucursalId,
      ultimaActualizacion: new Date(),
    };

    // Aquí iría la llamada a tu servicio para POST o PUT
    console.log(
      this.isEditing ? 'Llamada PUT (Actualizar):' : 'Llamada POST (Crear):',
      itemData
    );

    this.cancel();
    this.cargarDatosEjemplo();
  }

  // Usamos InventarioItem en la definición para que el tipo sea correcto
  editItem(producto: Producto): void {
    this.openModal(true, producto);
  }
}

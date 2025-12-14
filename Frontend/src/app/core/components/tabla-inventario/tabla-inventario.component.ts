import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Producto } from '../../../shared/models/producto.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabla-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-inventario.component.html',
  styleUrl: './tabla-inventario.component.css',
})
export class TablaInventarioComponent {
  // Recibe los productos del componente padre
  @Input() productosInventario: Producto[] | null = [];

  // Recibe el estado de carga del componente padre
  @Input() isLoading: boolean | null = true;

  // Emite el producto que se desea editar al padre
  @Output() editItem = new EventEmitter<Producto>();

  // Emite el producto que se desea eliminar al padre
  @Output() deleteItem = new EventEmitter<Producto>();

  seleccionarProducto(producto: Producto): void {
    console.log('Fila seleccionada:', producto.nombre);
  }

  // Los métodos de acción ahora EMITEN el evento
  editarProducto(producto: Producto): void {
    // Emitimos el evento al padre para que abra el modal
    this.editItem.emit(producto);
  }

  eliminarProducto(producto: Producto): void {
    // Emitimos el evento al padre para que muestre el modal de confirmación
    this.deleteItem.emit(producto);
  }
}

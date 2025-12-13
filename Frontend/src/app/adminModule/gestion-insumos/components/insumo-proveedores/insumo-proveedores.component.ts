import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para los inputs simples (ngModel)
import { Proveedor } from '../../../../shared/models/proveedor.model';

@Component({
  selector: 'app-insumo-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './insumo-proveedores.component.html',
  styleUrls: ['./insumo-proveedores.component.css']
})
export class InsumoProveedoresComponent {
  // Recibimos la lista MAESTRA de proveedores para llenar el select
  @Input() allProveedores: Proveedor[] = [];
  
  // Recibimos la lista de los que YA están asignados (para mostrar en la tablita)
  @Input() asignados: any[] = []; 
  
  // Avisamos al padre cuando la lista cambie
  @Output() asignadosChange = new EventEmitter<any[]>();

  // Variables temporales para el formulario de abajo
  selectedProveedorId: number | null = null;
  precioInput: number | null = null;

  addProveedor() {
    // 1. Validaciones básicas
    if (!this.selectedProveedorId) return;
    if (!this.precioInput || this.precioInput <= 0) {
      alert('Ingresa un precio válido');
      return;
    }

    // 2. Evitar duplicados
    const exists = this.asignados.find(p => p.proveedor_id == this.selectedProveedorId);
    if (exists) {
      alert('Este proveedor ya está en la lista. Bórralo si quieres corregir el precio.');
      return;
    }

    // 3. Buscar el nombre bonito para mostrarlo
    const provObj = this.allProveedores.find(p => p.proveedor_id == this.selectedProveedorId);

    // 4. Agregar a la lista local
    this.asignados.push({
      proveedor_id: this.selectedProveedorId,
      nombre_empresa: provObj?.nombre_empresa, // Guardamos el nombre solo para mostrarlo visualmente
      precio_compra: this.precioInput
    });

    // 5. Emitir cambio y limpiar inputs
    this.asignadosChange.emit(this.asignados);
    this.selectedProveedorId = null;
    this.precioInput = null;
  }

  removeProveedor(index: number) {
    this.asignados.splice(index, 1);
    this.asignadosChange.emit(this.asignados);
  }
}
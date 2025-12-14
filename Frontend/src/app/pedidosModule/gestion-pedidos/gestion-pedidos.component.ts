import { Component, ViewChild } from '@angular/core';
import { SucursalesService } from '../../adminModule/services/sucursales.service';
import { PedidosListComponent } from '../pedidos-list/pedidos-list.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoFormComponent } from '../pedidos-form/pedidos-form.component';

@Component({
  selector: 'app-gestion-pedidos',
  imports: [CommonModule, FormsModule, PedidosListComponent, PedidoFormComponent],
  templateUrl: './gestion-pedidos.component.html',
  styleUrl: './gestion-pedidos.component.css'
})
export class GestionPedidosComponent {
  
  // Referencia al componente hijo (La Tabla) para poder ordenarle cosas
  @ViewChild(PedidosListComponent) listaPedidos!: PedidosListComponent;

  sucursales: any[] = [];
  selectedSucursalId: number | null = null;
  showModal = false;

  constructor(private sucursalesService: SucursalesService) {}

  ngOnInit() {
    // Cargar el combo de sucursales al inicio
    this.sucursalesService.getSucursales().subscribe(data => {
      this.sucursales = data;
    });
  }

  // Se ejecuta cuando el Hijo Formulario nos avisa (onSave)
  handleSave() {
    this.showModal = false; // Cerramos el modal
    
    // Le ordenamos a la tabla que se refresque
    if (this.selectedSucursalId) {
      this.listaPedidos.loadPedidos();
    }
  }
}

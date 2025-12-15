import { Component, ViewChild } from '@angular/core';
import { SucursalesService } from '../../adminModule/services/sucursales.service';
import { PedidosListComponent } from '../pedidos-list/pedidos-list.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoFormComponent } from '../pedidos-form/pedidos-form.component';
import { PedidoDetalleComponent } from '../pedido-detalle/pedido-detalle.component';

@Component({
  selector: 'app-gestion-pedidos',
  imports: [CommonModule, FormsModule, PedidosListComponent, PedidoFormComponent, PedidoDetalleComponent],
  templateUrl: './gestion-pedidos.component.html',
  styleUrl: './gestion-pedidos.component.css'
})
export class GestionPedidosComponent {
  
  @ViewChild(PedidosListComponent) listaPedidos!: PedidosListComponent;

  sucursales: any[] = [];
  selectedSucursalId: number | null = null;
  showModal = false;
  
  // 1. NUEVO: Variable para guardar el pedido que vamos a editar
  pedidoParaEditar: any = null;

  selectedPedidoDetail: any = null;

  constructor(private sucursalesService: SucursalesService) {}

  ngOnInit() {
    this.sucursalesService.getSucursales().subscribe(data => {
      this.sucursales = data;
    });
  }

  // --- LÓGICA DEL MODAL ---

  // Botón "+ Nuevo Pedido"
  abrirModalNuevo() {
    this.pedidoParaEditar = null; // IMPORTANTE: Limpiamos para que el form sepa que es nuevo
    this.showModal = true;
  }

  // Esto se ejecuta cuando el Hijo Lista grita (editRequest)
  recibirSolicitudEdicion(pedido: any) {
    console.log('Editando pedido:', pedido);
    this.pedidoParaEditar = pedido; // Guardamos el pedido recibido
    this.showModal = true;          // Abrimos el modal
  }

  // Cerrar modal (botón cancelar o X)
  cerrarModal() {
    this.showModal = false;
    this.pedidoParaEditar = null; // Limpiamos siempre al cerrar
  }

  // Se ejecuta cuando el Hijo Formulario avisa (onSave)
  handleSave() {
    this.cerrarModal(); // Reutilizamos la lógica de cierre
    
    // Refrescamos la tabla
    if (this.selectedSucursalId) {
      this.listaPedidos.loadPedidos();
    }
  }

  // --- LÓGICA DE DETALLES (Ya la tenías) ---
  openDetail(pedido: any) {
    this.selectedPedidoDetail = pedido;
  }

  closeDetail() {
    this.selectedPedidoDetail = null;
  }
}

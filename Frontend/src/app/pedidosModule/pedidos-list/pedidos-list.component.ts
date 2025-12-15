import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PedidosService } from '../../adminModule/services/pedidos.service';

@Component({
  selector: 'app-pedidos-list',
  imports: [CommonModule],
  templateUrl: './pedidos-list.component.html',
  styleUrl: './pedidos-list.component.css'
})
export class PedidosListComponent {
  @Input() sucursalId: number | null = null;
  
  // Emitimos eventos al Padre cuando hagan click
  @Output() editRequest = new EventEmitter<any>();
  @Output() deleteRequest = new EventEmitter<number>();
  @Output() viewRequest = new EventEmitter<any>();

  pedidos: any[] = [];
  isLoading = false;

  constructor(private service: PedidosService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sucursalId'] && this.sucursalId) {
      this.loadPedidos();
    } else if (!this.sucursalId) {
      this.pedidos = [];
    }
  }

  loadPedidos() {
    this.isLoading = true;
    this.service.getPedidosBySucursal(this.sucursalId!).subscribe({
      next: (data) => {
        this.pedidos = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // Lógica Frontend para Editar
  onEdit(pedido: any) {
    // Por ahora solo avisamos, después conectaremos el formulario
    this.editRequest.emit(pedido); 
  }

  // Lógica Frontend para Eliminar
  onDelete(pedido: any) {
    // Confirmación simple
    if (confirm(`¿Estás seguro de eliminar el pedido de ${pedido.sucursal_nombre} con fecha ${new Date(pedido.fecha).toLocaleDateString()}?`)) {
       
       this.service.deletePedido(pedido.pedido_id).subscribe({
         next: () => {
           // Éxito: Solo recargamos la tabla
           this.loadPedidos(); 
         },
         error: (err) => {
           console.error(err);
           alert('Error al eliminar. Intenta de nuevo.');
         }
       });
    }
  }

  onView(pedido: any) {
    this.viewRequest.emit(pedido);
  }

  
}
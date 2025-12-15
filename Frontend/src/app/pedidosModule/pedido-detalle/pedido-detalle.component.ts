import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PedidosService } from '../../adminModule/services/pedidos.service';

@Component({
  selector: 'app-pedido-detalle',
  imports: [CommonModule],
  templateUrl: './pedido-detalle.component.html',
  styleUrl: './pedido-detalle.component.css'
})
export class PedidoDetalleComponent {
  @Input() pedido: any; // Recibimos el objeto completo (Cabecera)
  @Output() onClose = new EventEmitter<void>();

  detalles: any[] = [];
  isLoading = true;

  constructor(private service: PedidosService) {}

  ngOnInit() {
    if (this.pedido) {
      this.loadDetalles();
    }
  }

  loadDetalles() {
    this.isLoading = true;
    this.service.getDetallePedido(this.pedido.pedido_id).subscribe({
      next: (data) => {
        this.detalles = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  close() {
    this.onClose.emit();
  }
}

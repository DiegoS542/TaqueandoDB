import { Component } from '@angular/core';
import { PedidosService } from '../../adminModule/services/pedidos.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  
  fechaActual = new Date(); // Para mostrar la fecha en el Hero
  
  stats: any = {
    total_gastado: 0,
    pedidos_hoy: 0,
    sucursal_lider: 'Cargando...',
    variedad_productos: 0
  };

  // Inyectar Router
  constructor(private pedidosService: PedidosService, private router: Router) {}

  ngOnInit() {
    this.pedidosService.getStats().subscribe({
      next: (data) => this.stats = data,
      error: (err) => this.stats.sucursal_lider = 'Sin datos'
    });
  }

  // Función para navegar
  irAPedidos() {
    this.router.navigate(['/admin/pedidos']); // Ajusta la ruta a la tuya real
  }
}

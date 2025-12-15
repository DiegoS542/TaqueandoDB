import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { VentasService } from '../services/ventas.service';
// 1. IMPORTAR AUTH Y MODELO
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../shared/models/usuario.model';

@Component({
  selector: 'app-historial-ventas',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './historial-ventas.component.html',
  styleUrls: ['./historial-ventas.component.css']
})
export class HistorialVentasComponent implements OnInit {

  ventas: any[] = [];             // Lista filtrada (la que ve el usuario)
  todasLasVentas: any[] = [];     // 2. NUEVO: Lista original completa (Respaldo)
  ventaSeleccionada: any = null;  
  cargando: boolean = false;      

  constructor(
    private ventasService: VentasService,
    private authService: AuthService // 3. NUEVO: Inyectar AuthService
  ) { }

  ngOnInit(): void {
    this.cargarHistorial();
  }

  // 1. Obtener la lista general y filtrar
  cargarHistorial() {
    this.cargando = true;
    this.ventasService.getVentas().subscribe({
      next: (data) => {
        this.todasLasVentas = data; // Guardamos TODO primero
        
        // 4. NUEVO: Llamamos al filtro inmediatamente
        this.aplicarFiltroPorRol();
        
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  // 5. NUEVO: Lógica de filtrado en el cliente
  aplicarFiltroPorRol() {
    const usuario: Usuario | null = this.authService.getCurrentUser();

    if (usuario && usuario.sucursalId) {
      // SI ES GERENTE (Tiene ID de sucursal): Filtramos solo las suyas
      // Nota: Asegúrate que tu BD devuelva el campo 'sucursal_id' en snake_case o camelCase según corresponda
      this.ventas = this.todasLasVentas.filter(v => v.sucursal_id === usuario.sucursalId);
    } else {
      // SI ES ADMIN/OPERACIONES (sucursalId es null): Mostramos todo
      this.ventas = this.todasLasVentas;
    }
  }

  // 2. Ver detalles de una venta específica
  verDetalle(idVenta: number) {
    this.ventasService.getVentaPorId(idVenta).subscribe({
      next: (data) => {
        this.ventaSeleccionada = data; 
      },
      error: (err) => console.error('Error al cargar detalle', err)
    });
  }

  // 3. Cerrar el modal
  cerrarDetalle() {
    this.ventaSeleccionada = null;
  }
}
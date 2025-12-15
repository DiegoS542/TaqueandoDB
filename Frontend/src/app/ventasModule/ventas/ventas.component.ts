import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <--- NECESARIO para ngClass
import { RegistroVentaComponent } from '../registro-venta/registro-venta.component'; // <--- IMPORTAR HIJO
import { HistorialVentasComponent } from '../historial-ventas/historial-ventas.component'; // <--- IMPORTAR HIJO

@Component({
  selector: 'app-ventas',
  standalone: true, // <--- Importante: Debe ser true
  imports: [
    CommonModule,            // Habilita ngClass, ngIf, etc.
    RegistroVentaComponent,  // Habilita <app-registro-venta>
    HistorialVentasComponent // Habilita <app-historial-ventas>
  ],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent {
  vistaActual: string = 'registro';

  cambiarVista(vista: string) {
    this.vistaActual = vista;
  }
}
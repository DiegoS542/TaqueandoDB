// Frontend/src/app/services/ventas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
@Injectable({
  providedIn: 'root'
})
export class VentasService {
  // Asegúrate de que apunte a tu backend correcto
  private apiUrl = `${environment.apiUrl}/ventas`; 

  constructor(private http: HttpClient) { }

  registrarVenta(venta: any): Observable<any> {
    return this.http.post(this.apiUrl, venta);
  }

  // --- NUEVOS MÉTODOS ---

  // Obtener historial completo
  getVentas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Obtener detalle de una venta por ID
  getVentaPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
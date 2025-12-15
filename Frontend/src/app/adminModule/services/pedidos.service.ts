import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service'; 
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private apiUrl = `${environment.apiUrl}/pedidos`;

  // Ya no necesitamos 'supabase' ni 'createClient' aquí
  constructor(private http: HttpClient, private authService: AuthService) { }

  // Helper para enviar el Token
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  // Obtener pedidos de una sucursal específica
  getPedidosBySucursal(sucursalId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sucursal/${sucursalId}`, { headers: this.getHeaders() });
  }

  // Crear un nuevo pedido
  createPedido(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload, { headers: this.getHeaders() });
  }

  // Obtener detalle (Vía API Backend)
  getDetallePedido(pedidoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${pedidoId}/detalle`, { headers: this.getHeaders() });
  }

  deletePedido(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  updatePedido(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  // CORREGIDO: Ahora usa tu API en lugar de conectarse directo a Supabase
  // Asumimos que tu backend tiene una ruta para obtener los items
  getDetallesPedido(pedidoId: number): Observable<any[]> {
    // Reutilizamos la lógica HTTP. Si tu backend usa la ruta '/detalle', usamos esa.
    return this.http.get<any[]>(`${this.apiUrl}/${pedidoId}/detalle`, { headers: this.getHeaders() });
  }
}
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

  // Crear un nuevo pedido (El backend se encarga del cálculo con Cursor)
  createPedido(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload, { headers: this.getHeaders() });
  }

  getDetallePedido(pedidoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${pedidoId}/detalle`, { headers: this.getHeaders() });
  }

  deletePedido(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  updatePedido(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/pedidos/${id}`, data);
  }

  getDetallesPedido(pedidoId: number) {
  // Ajusta 'pedido_items' al nombre real de tu tabla intermedia en Supabase
  // Y asegúrate de traer el precio para que coincida con la interfaz
  return this.supabase
    .from('pedido_items')
    .select('*') 
    .eq('pedido_id', pedidoId);
}
}
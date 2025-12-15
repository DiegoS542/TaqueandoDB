import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // ¡Importar HttpHeaders!
import { Observable } from 'rxjs';
// Aquí deberías importar tu interfaz InventarioItem completa (con ID y sucursalId)
import { Producto } from '../../shared/models/producto.model';
import { environment } from '../../../environments/environments';

// Interfaz para la respuesta de la API (asumiendo formato { msg, data })
interface ApiResponse<T> {
  msg: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  // 🔥 CORRECCIÓN: Asegurar que el path comience con /api/ o solo con / si environment.apiUrl incluye el host
  private apiUrl = environment.apiUrl + '/api/inventario';

  constructor(private http: HttpClient) {}

  /**
   * Genera las cabeceras de autorización.
   * Lo ideal es usar un interceptor, pero para simplicidad, lo hacemos aquí.
   */
  private getAuthHeaders(token: string | null): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    // Si el token existe, lo adjuntamos
    if (token) {
      console.log('Adjuntando token a las cabeceras:', token);
      headers = headers.set('Authorization', `Bearer ${token}`); // Estándar para JWT
    }
    return headers;
  }

  listarInventario(token: string | null): Observable<ApiResponse<Producto[]>> {
    console.log('Token recibido en el servicio:', token);
    const headers = this.getAuthHeaders(token);
    // GET /api/inventario
    return this.http.get<ApiResponse<Producto[]>>(this.apiUrl, { headers });
  }

  crearItem(
    item: Producto,
    token: string | null
  ): Observable<ApiResponse<Producto>> {
    const headers = this.getAuthHeaders(token);
    // POST /api/inventario
    const dataToSend = {
      codigo: item.codigo,
      nombre: item.nombre,
      insumoPrincipal: item.insumoPrincipal,
      stockActual: item.stockActual,
      unidad: item.unidad,
      sucursal: item.sucursalId,
    };
    return this.http.post<ApiResponse<Producto>>(this.apiUrl, dataToSend, {
      headers,
    });
  }

  actualizarItem(
    item: Producto,
    token: string | null
  ): Observable<ApiResponse<Producto>> {
    const headers = this.getAuthHeaders(token);
    // PUT /api/inventario/:id
    if (!item.codigo) {
      throw new Error('El código del ítem es requerido para actualizar.');
    }

    const dataToSend = {
      codigo: item.codigo,
      nombre: item.nombre,
      insumoPrincipal: item.insumoPrincipal,
      stockActual: item.stockActual,
      unidad: item.unidad,
      sucursal: item.sucursalId,
    };

    return this.http.put<ApiResponse<Producto>>(
      `${this.apiUrl}/${item.codigo}`,
      dataToSend,
      { headers }
    );
  }

  eliminarItem(
    id: string,
    token: string | null
  ): Observable<ApiResponse<Producto>> {
    const headers = this.getAuthHeaders(token);
    // DELETE /api/inventario/:id
    return this.http.delete<ApiResponse<Producto>>(`${this.apiUrl}/${id}`, {
      headers,
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environments';

export interface Producto {
  producto_id: number;
  nombre: string;
  descripcion: string;
  precio_venta: number;
  categoria: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  // 🔐 RUTAS ADMIN (CRUD)
  private adminUrl = `${environment.apiUrl}/productos`;

  // 🛒 RUTA VENTAS (SOLO LECTURA)
  private ventaUrl = `${environment.apiUrl}/productos/venta`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  // =============================
  // ADMIN - CRUD PRODUCTOS
  // =============================

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.adminUrl, {
      headers: this.getHeaders()
    });
  }

  createProducto(producto: any): Observable<any> {
    return this.http.post(this.adminUrl, producto, {
      headers: this.getHeaders()
    });
  }

  updateProducto(id: number, producto: any): Observable<any> {
    return this.http.put(`${this.adminUrl}/${id}`, producto, {
      headers: this.getHeaders()
    });
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // =============================
  // VENTAS - SOLO CONSULTA
  // =============================

  getProductosVenta(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.ventaUrl);
  }
}

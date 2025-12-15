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

  private apiUrl = `${environment.apiUrl}/productos/venta`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  // =============================
  // CRUD DE PRODUCTOS
  // =============================

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  createProducto(producto: any): Observable<any> {
    return this.http.post(this.apiUrl, producto, {
      headers: this.getHeaders()
    });
  }

  updateProducto(id: number, producto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, producto, {
      headers: this.getHeaders()
    });
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}

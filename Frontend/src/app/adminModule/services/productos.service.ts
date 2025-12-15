import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments'; // Revisa la ruta de tus environments

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
  // Apuntamos a la ruta específica de venta
  private apiUrl = `${environment.apiUrl}/productos/venta`; 

  constructor(private http: HttpClient) { }

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }
}
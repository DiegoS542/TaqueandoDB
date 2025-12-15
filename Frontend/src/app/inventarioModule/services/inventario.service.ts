import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { Insumo } from '../../shared/models/insumo.model';
import { ApiResponse } from '../../shared/models/ApiResponse.model';

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  private apiUrl = environment.apiUrl + '/inventario';

  constructor(private http: HttpClient) {}

  crearInventario(sucursalId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, {
      sucursal_id: sucursalId,
    });
  }

  guardarDetalle(
  inventarioId: number,
  detalles: { insumo_id: number; cantidad: number }[]
) {
  return this.http.post(`${this.apiUrl}/detalle`, {
    inventario_id: inventarioId,
    detalles,
  });
}


  listarInsumos(): Observable<ApiResponse<Insumo[]>> {
    return this.http.get<ApiResponse<Insumo[]>>(
      `${environment.apiUrl}/insumos`
    );
  }

  cargarSucursales(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/sucursales`);
  }
}

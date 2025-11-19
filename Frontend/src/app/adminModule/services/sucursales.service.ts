import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sucursal } from '../../shared/models/sucursal.model';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class SucursalesService {

  private apiUrl = `${environment.apiUrl}/sucursales`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Helper para obtener los headers con el token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getSucursales(): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createSucursal(sucursal: Sucursal): Observable<Sucursal> {
    return this.http.post<Sucursal>(this.apiUrl, sucursal, { headers: this.getHeaders() });
  }

  updateSucursal(id: number, sucursal: Sucursal): Observable<Sucursal> {
    return this.http.put<Sucursal>(`${this.apiUrl}/${id}`, sucursal, { headers: this.getHeaders() });
  }

  deleteSucursal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}

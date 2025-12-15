import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Insumo } from '../../shared/models/insumo.model';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class InsumosService {
  private apiUrl = `${environment.apiUrl}/insumos`; // Asegúrate de haber creado esta ruta en el back

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getInsumos(): Observable<Insumo[]> {
    return this.http.get<Insumo[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createInsumo(insumo: any): Observable<any> {
    return this.http.post(this.apiUrl, insumo, { headers: this.getHeaders() });
  }

  updateInsumo(id: number, insumo: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, insumo, { headers: this.getHeaders() });
  }

  deleteInsumo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
import { Injectable } from '@angular/core';
import { Usuario } from '../../shared/models/usuario.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environments';
import { Observable } from 'rxjs';

// Interfaz auxiliar para enviar datos
export interface UsuarioRequest extends Usuario {
  password?: string; // Opcional porque al editar puede ir vacío
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  getUsuarios(): Observable<any[]> { // Usamos any[] temporalmente porque la respuesta trae "nombre_sucursal" extra
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createUsuario(usuario: any): Observable<any> {
    return this.http.post(this.apiUrl, usuario, { headers: this.getHeaders() });
  }

  updateUsuario(id: number, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario, { headers: this.getHeaders() });
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}

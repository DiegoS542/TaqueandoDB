import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';

const API_URL = 'http://localhost:3000/api/auth';

// Interfaz para el payload de nuestro token
interface AuthTokenPayload {
  usuario_id: number;
  rol: 'admin' | 'operaciones' | 'gerente';
  sucursal_id: number | null;
  iat: number; // "Issued at" (fecha de creación)
  exp: number; // "Expires at" (fecha de expiración)
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) { }

  //Llama al endpoint de login en el backend
  public login(username: string, password: string): Observable<{token: string}> {
    return this.http.post<{token: string}>(`${API_URL}/login`, { username, password }).pipe(
      tap(response => {
        // Si el login es exitoso, guarda el token en el almacenamiento local
        localStorage.setItem('authToken', response.token);
      })
    );
  }

  //Cierra la sesión del ususario
  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  //Obtiene el token guardado
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  //Revisa si hay un token, para saber si está atuenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return true;
  }

  /**
   * Decodifica el token guardado y devuelve el payload
   */
  private getDecodedToken(): AuthTokenPayload | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      return jwtDecode<AuthTokenPayload>(token);
    } catch (error) {
      console.error("Error decodificando el token", error);
      this.logout(); // Si el token es inválido, cerramos sesión
      return null;
    }
  }

  /**
   * Obtiene el ROL del usuario logueado
   */
  getUserRole(): 'admin' | 'operaciones' | 'gerente' | null {
    const payload = this.getDecodedToken();
    return payload ? payload.rol : null;
  }

  /**
   * Obtiene la SUCURSAL del usuario logueado (si es gerente)
   */
  getUserSucursalId(): number | null {
     const payload = this.getDecodedToken();
     return payload ? payload.sucursal_id : null;
  }
}

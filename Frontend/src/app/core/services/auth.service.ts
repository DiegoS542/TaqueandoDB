import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../../shared/models/usuario.model';
import { environment } from '../../../environments/environments';

const API_URL = `${environment.apiUrl}/auth`;

// Interfaz para el payload de nuestro token
interface AuthTokenPayload {
  usuario_id: number;
  username: string;
  nombre: string; 
  rol: 'admin' | 'operaciones' | 'gerente';
  sucursal_id: number | null;
  iat: number; // "Issued at" (fecha de creación)
  exp: number; // "Expires at" (fecha de expiración)
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Aquí guardamos el estado del usuario logueado
  private currentUser: Usuario | null = null;
  
  constructor(private http: HttpClient, private router: Router) { 
    // Al cargar el servicio, intenta rehidratar al usuario desde el token guardado
    this.loadUserFromToken();
  }

  //Llama al endpoint de login en el backend
  public login(username: string, password: string): Observable<{token: string}> {
    return this.http.post<{token: string}>(`${API_URL}/login`, { username, password }).pipe(
      tap(response => {
        // Si el login es exitoso, guarda el token en el almacenamiento local
        localStorage.setItem('authToken', response.token);
        // Al hacer login, decodifica y guarda al usuario
        this.decodeAndSetUser(response.token);
      })
    );
  }

  //Cierra la sesión del ususario
  logout(): void {
    localStorage.removeItem('authToken');
    this.currentUser = null;
    this.router.navigate(['/login']);
  }

  //Obtiene el token guardado
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  //Revisa si hay un token, para saber si está atuenticado
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  //Devuelve el objeto Usuario completo
  public getCurrentUser(): Usuario | null {
    return this.currentUser;
  }
  //Devuelve solo el rol
  getUserRole(): 'admin' | 'operaciones' | 'gerente' | null {
    return this.currentUser ? this.currentUser.rol : null;
  }

  //Decodifica el token guardado y devuelve el payload
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

  private loadUserFromToken(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.decodeAndSetUser(token);
    }
  }

  private decodeAndSetUser(token: string): void {
    try {
      const payload = jwtDecode<AuthTokenPayload>(token);
      
      // Mapea los nombres de la BD (snake_case) a tu modelo (camelCase)
      this.currentUser = {
        id: payload.usuario_id,
        username: payload.username, 
        nombre: payload.nombre,
        rol: payload.rol,
        sucursalId: payload.sucursal_id
      };
      
      // Opcional: Verificar si el token ha expirado
      // const expiry = payload.exp * 1000;
      // if (Date.now() >= expiry) {
      //   this.logout();
      // }

    } catch (error) {
      console.error("Token inválido, cerrando sesión.", error);
      this.logout();
    }
  }

  /**
   * Obtiene la SUCURSAL del usuario logueado (si es gerente)
   */
  getUserSucursalId(): number | null {
     const payload = this.getDecodedToken();
     return payload ? payload.sucursal_id : null;
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

const API_URL = 'http://localhost:3000/api/auth';

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
    return this.getToken() !== null;
  }
}

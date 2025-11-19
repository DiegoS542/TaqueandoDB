import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      //email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.invalid) {
      return; // No hacer nada si el formulario es inválido
    }

    this.errorMessage = null;
    //const { email, password } = this.loginForm.value;
    const { username, password } = this.loginForm.value;

    //this.authService.login(email, password).subscribe({
    this.authService.login(username, password).subscribe({
      next: () => {
        // Si el login es exitoso, el AuthService guarda el token
        // y el guardia de ruta nos llevará al dashboard.
        this.router.navigate(['/app']); 
      },
      error: (err) => {
        this.errorMessage = 'Usuario o contraseña incorrectos. Intenta de nuevo.';
      }
    });
  }
}

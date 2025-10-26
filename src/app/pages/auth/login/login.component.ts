// ============================================
// src/app/pages/auth/login/login.component.ts
// ============================================
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Si déjà connecté, rediriger
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Connexion réussie:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        this.loading = false;
        
        if (error.error?.message) {
          this.error = error.error.message;
        } else if (error.error?.errors) {
          this.error = Object.values(error.error.errors).flat().join(', ');
        } else {
          this.error = 'Une erreur est survenue. Veuillez réessayer.';
        }
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
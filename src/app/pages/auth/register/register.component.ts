// ============================================
// src/app/pages/auth/register/register.component.ts
// ============================================
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error: string = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Si déjà connecté, rediriger
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }

    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern(/^\+?[0-9]{9,15}$/)]],
      date_naissance: ['', [Validators.required, this.dateValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validator personnalisé pour la date de naissance
  dateValidator(control: AbstractControl): {[key: string]: any} | null {
    if (!control.value) return null;
    
    const today = new Date();
    const birthDate = new Date(control.value);
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (birthDate > today) {
      return { 'futureDate': true };
    }
    if (age < 13) {
      return { 'tooYoung': true };
    }
    return null;
  }

  // Validator pour vérifier que les mots de passe correspondent
  passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmPassword = control.get('password_confirmation');

    if (!password || !confirmPassword) return null;

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ 'passwordMismatch': true });
      return { 'passwordMismatch': true };
    }

    return null;
  }

  get nom() { return this.registerForm.get('nom'); }
  get prenom() { return this.registerForm.get('prenom'); }
  get email() { return this.registerForm.get('email'); }
  get telephone() { return this.registerForm.get('telephone'); }
  get date_naissance() { return this.registerForm.get('date_naissance'); }
  get password() { return this.registerForm.get('password'); }
  get password_confirmation() { return this.registerForm.get('password_confirmation'); }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        console.log('Inscription réussie:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Erreur d\'inscription:', error);
        this.loading = false;
        
        if (error.error?.message) {
          this.error = error.error.message;
        } else if (error.error?.errors) {
          const errors = error.error.errors;
          this.error = Object.values(errors).flat().join(', ');
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
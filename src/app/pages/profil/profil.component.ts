// ============================================
// src/app/pages/profil/profil.component.ts
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css'
})
export class ProfilComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;
  
  // Onglets
  activeTab: 'informations' | 'securite' | 'statistiques' = 'informations';
  
  // Formulaires
  infoForm: FormGroup;
  passwordForm: FormGroup;
  
  // États
  submittingInfo = false;
  submittingPassword = false;
  successMessage = '';
  errorMessage = '';
  
  // Statistiques (pour les lecteurs)
  stats = {
    total_emprunts: 0,
    emprunts_en_cours: 0,
    livres_lus: 0,
    retards: 0,
    penalites_total: 0,
    membre_depuis: ''
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Formulaire informations personnelles
    this.infoForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern(/^[0-9]{9,15}$/)]],
      date_naissance: ['']
    });

    // Formulaire changement de mot de passe
    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      new_password_confirmation: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.loading = true;
    this.authService.getProfile().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentUser = response.data.user;
          this.fillForm();
          
          // Charger les stats si c'est un lecteur
          if (this.isLecteur) {
            this.loadStatistics();
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement profil:', error);
        this.errorMessage = 'Impossible de charger le profil';
        this.loading = false;
      }
    });
  }

  fillForm() {
    if (this.currentUser) {
      this.infoForm.patchValue({
        nom: this.currentUser.nom,
        prenom: this.currentUser.prenom,
        email: this.currentUser.email,
        telephone: this.currentUser.telephone || '',
     //   date_naissance: this.currentUser.date_naissance || ''
      });
    }
  }

  loadStatistics() {
    // TODO: Implémenter l'appel API pour récupérer les statistiques
    // Pour l'instant, données fictives
    this.stats = {
      total_emprunts: 45,
      emprunts_en_cours: 3,
      livres_lus: 42,
      retards: 2,
      penalites_total: 1500,
      membre_depuis: this.currentUser?.created_at || new Date().toISOString()
    };
  }

  // Validation personnalisée pour la confirmation du mot de passe
  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('new_password')?.value;
    const confirmation = group.get('new_password_confirmation')?.value;
    return newPassword === confirmation ? null : { passwordMismatch: true };
  }

  // Soumettre les informations personnelles
  submitInfoForm() {
    if (this.infoForm.invalid) {
      Object.keys(this.infoForm.controls).forEach(key => {
        this.infoForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submittingInfo = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.updateProfile(this.infoForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Informations mises à jour avec succès !';
          this.loadUserProfile();
        }
        this.submittingInfo = false;
      },
      error: (error) => {
        console.error('Erreur mise à jour:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour';
        this.submittingInfo = false;
      }
    });
  }

  // Soumettre le changement de mot de passe
  submitPasswordForm() {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submittingPassword = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Mot de passe modifié avec succès !';
          this.passwordForm.reset();
        }
        this.submittingPassword = false;
      },
      error: (error) => {
        console.error('Erreur changement mot de passe:', error);
        this.errorMessage = error.error?.message || 'Erreur lors du changement de mot de passe';
        this.submittingPassword = false;
      }
    });
  }

  // Changer d'onglet
  setActiveTab(tab: 'informations' | 'securite' | 'statistiques') {
    this.activeTab = tab;
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Helpers pour la validation des formulaires
  isFieldInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'Ce champ est requis';
    if (control.errors['email']) return 'Email invalide';
    if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} caractères`;
    if (control.errors['pattern']) return 'Format invalide';

    return 'Champ invalide';
  }

  getPasswordError(): string {
    if (this.passwordForm.errors?.['passwordMismatch'] && this.passwordForm.get('new_password_confirmation')?.touched) {
      return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }

  // Getters
  get userInitials(): string {
    if (!this.currentUser) return '';
    const prenom = this.currentUser.prenom?.[0] || '';
    const nom = this.currentUser.nom?.[0] || '';
    return (prenom + nom).toUpperCase();
  }

  get userRoleLabel(): string {
    if (!this.currentUser) return '';
    const roles: any = {
      'administrateur': 'Administrateur',
      'bibliothecaire': 'Bibliothécaire',
      'lecteur': 'Lecteur'
    };
    return roles[this.currentUser.role] || 'Utilisateur';
  }

  get userRoleColor(): string {
    if (!this.currentUser) return 'lecteur';
    return this.currentUser.role === 'administrateur' ? 'admin' : 
           this.currentUser.role === 'bibliothecaire' ? 'staff' : 'lecteur';
  }

  get isLecteur(): boolean {
    return this.currentUser?.role === 'lecteur';
  }

  get memberSince(): string {
    if (!this.currentUser?.created_at) return '';
    const date = new Date(this.currentUser.created_at);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('fr-FR', options);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  // Calculer le temps depuis l'inscription
  getMembershipDuration(): string {
    if (!this.stats.membre_depuis) return '-';
    
    const start = new Date(this.stats.membre_depuis);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} jours`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mois`;
    return `${Math.floor(diffDays / 365)} ans`;
  }
}
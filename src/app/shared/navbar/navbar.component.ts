// ============================================
// src/app/shared/navbar/navbar.component.ts
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isAuthenticated = false;
  mobileMenuOpen = false;
  userMenuOpen = false;
  adminMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // S'abonner aux changements d'utilisateur
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    // Fermer les autres menus
    this.userMenuOpen = false;
    this.adminMenuOpen = false;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
    this.adminMenuOpen = false;
  }

  toggleAdminMenu() {
    this.adminMenuOpen = !this.adminMenuOpen;
    this.userMenuOpen = false;
  }

  closeAllMenus() {
    this.mobileMenuOpen = false;
    this.userMenuOpen = false;
    this.adminMenuOpen = false;
  }

logout() {
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    this.authService.logout().subscribe({
      next: () => {
        this.closeAllMenus();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        // Même en cas d'erreur, on déconnecte côté client
        this.closeAllMenus();
        this.router.navigate(['/login']);
      }
    });
  }
}

  // Vérifier les rôles
  get isLecteur(): boolean {
    return this.currentUser?.role === 'lecteur';
  }

  get isBibliothecaire(): boolean {
    return this.currentUser?.role === 'bibliothecaire';
  }

  get isAdministrateur(): boolean {
    return this.currentUser?.role === 'administrateur';
  }

  get isStaff(): boolean {
    return this.isBibliothecaire || this.isAdministrateur;
  }

  get userInitials(): string {
    if (!this.currentUser) return '';
    const prenom = this.currentUser.prenom?.[0] || '';
    const nom = this.currentUser.nom?.[0] || '';
    return (prenom + nom).toUpperCase();
  }

  get userRoleLabel(): string {
    if (this.isAdministrateur) return 'Administrateur';
    if (this.isBibliothecaire) return 'Bibliothécaire';
    if (this.isLecteur) return 'Lecteur';
    return 'Utilisateur';
  }

  get userRoleColor(): string {
    if (this.isAdministrateur) return 'admin';
    if (this.isBibliothecaire) return 'staff';
    return 'lecteur';
  }
}
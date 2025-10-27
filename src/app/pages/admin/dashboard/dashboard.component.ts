// ============================================
// src/app/pages/admin/dashboard/dashboard.component.ts
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EmpruntService } from '../../../core/services/emprunt.service';
import { LivreService } from '../../../core/services/livre.service';
import { User } from '../../../core/models/user';
import { Emprunt } from '../../../core/models/emprunt';
import { Livre } from '../../../core/models/livre';

interface DashboardStats {
  total_livres: number;
  livres_disponibles: number;
  total_emprunts: number;
  emprunts_en_cours: number;
  emprunts_en_retard: number;
  total_utilisateurs: number;
  penalites_impayees: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;
  error = '';

  stats: DashboardStats = {
    total_livres: 0,
    livres_disponibles: 0,
    total_emprunts: 0,
    emprunts_en_cours: 0,
    emprunts_en_retard: 0,
    total_utilisateurs: 0,
    penalites_impayees: 0
  };

  derniersEmprunts: Emprunt[] = [];
  livresPopulaires: Livre[] = [];
  empruntsEnRetard: Emprunt[] = [];

  constructor(
    private authService: AuthService,
    private empruntService: EmpruntService,
    private livreService: LivreService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.error = '';

    // Charger les statistiques des emprunts
    this.empruntService.getStatistiques().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats.emprunts_en_cours = response.data.emprunts_en_cours || 0;
          this.stats.emprunts_en_retard = response.data.emprunts_en_retard || 0;
          this.stats.total_emprunts = response.data.total_emprunts || 0;
        }
      },
      error: (error) => {
        console.error('Erreur chargement stats emprunts:', error);
      }
    });

    // Charger les statistiques des livres
    this.livreService.getLivres({ per_page: 1000 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const livres = response.data.data;
          this.stats.total_livres = livres.length;
          this.stats.livres_disponibles = livres.filter(l => l.est_disponible).length;
        }
      },
      error: (error) => {
        console.error('Erreur chargement stats livres:', error);
      }
    });

    // Charger les derniers emprunts
    this.empruntService.getAllEmprunts({ per_page: 5 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.derniersEmprunts = response.data.data || [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement derniers emprunts:', error);
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
      }
    });

    // Charger les livres populaires
    this.livreService.getLivresPopulaires().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.livresPopulaires = response.data.slice(0, 5);
        }
      },
      error: (error) => {
        console.error('Erreur chargement livres populaires:', error);
      }
    });

    // Simuler stats utilisateurs (à remplacer par vraie API)
    this.stats.total_utilisateurs = 150; // Temporaire
    this.stats.penalites_impayees = 25000; // Temporaire
  }

  getStatutClass(emprunt: Emprunt): string {
    if (emprunt.est_en_retard) return 'danger';
    return 'success';
  }

  getStatutLabel(emprunt: Emprunt): string {
    if (emprunt.est_en_retard) {
      return `En retard (${emprunt.jours_de_retard}j)`;
    }
    return 'En cours';
  }

  getDefaultCover(titre: string): string {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    const index = titre.length % colors.length;
    return colors[index];
  }

  get pourcentageLivresDisponibles(): number {
    if (this.stats.total_livres === 0) return 0;
    return Math.round((this.stats.livres_disponibles / this.stats.total_livres) * 100);
  }

  get pourcentageEmpruntsEnRetard(): number {
    if (this.stats.emprunts_en_cours === 0) return 0;
    return Math.round((this.stats.emprunts_en_retard / this.stats.emprunts_en_cours) * 100);
  }

  get tauxOccupation(): number {
    const empruntes = this.stats.total_livres - this.stats.livres_disponibles;
    if (this.stats.total_livres === 0) return 0;
    return Math.round((empruntes / this.stats.total_livres) * 100);
  }

  get alertesCount(): number {
    return this.stats.emprunts_en_retard;
  }

  get hasAlertes(): boolean {
    return this.stats.emprunts_en_retard > 0 || this.stats.penalites_impayees > 0;
  }
}
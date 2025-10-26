// ============================================
// src/app/pages/lecteur/dashboard/dashboard.component.ts
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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  empruntsEnCours: Emprunt[] = [];
  nouveauxLivres: Livre[] = [];
  loading = true;
  error = '';

  stats = {
    emprunts_en_cours: 0,
    quota_disponible: 0,
    emprunts_en_retard: 0,
    penalites_impayees: 0
  };

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

    // Charger les emprunts en cours
    this.empruntService.getMesEmprunts().subscribe({
      next: (response) => {
        if (response.success) {
          this.empruntsEnCours = response.data.emprunts;
          
          // Calculer les statistiques
          this.stats.emprunts_en_cours = response.data.total;
          this.stats.quota_disponible = response.data.quota - response.data.total;
          this.stats.emprunts_en_retard = this.empruntsEnCours.filter(e => e.est_en_retard).length;
          
          if (this.currentUser?.lecteur) {
            this.stats.penalites_impayees = this.currentUser.lecteur.penalites_impayees || 0;
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement emprunts:', error);
        this.error = 'Erreur lors du chargement des emprunts';
        this.loading = false;
      }
    });

    // Charger les nouveaux livres
    this.livreService.getNouveauxLivres().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.nouveauxLivres = response.data.slice(0, 4); // Limiter à 4 livres
        }
      },
      error: (error) => {
        console.error('Erreur chargement nouveaux livres:', error);
      }
    });
  }

  prolongerEmprunt(emprunt: Emprunt) {
    if (!confirm('Voulez-vous prolonger cet emprunt de 7 jours ?')) {
      return;
    }

    this.empruntService.prolonger(emprunt.id).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Emprunt prolongé avec succès !');
          this.loadDashboardData(); // Recharger les données
        }
      },
      error: (error) => {
        console.error('Erreur prolongation:', error);
        alert(error.error?.message || 'Erreur lors de la prolongation');
      }
    });
  }

  getJoursRestantsColor(emprunt: Emprunt): string {
    if (emprunt.est_en_retard) return 'danger';
    if (emprunt.jours_restants && emprunt.jours_restants <= 3) return 'warning';
    return 'success';
  }

  getDefaultCover(titre: string): string {
    // Générer une couleur basée sur le titre
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
    const index = titre.length % colors.length;
    return colors[index];
  }
}
// ============================================
// src/app/pages/lecteur/mes-emprunts/mes-emprunts.component.ts
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmpruntService } from '../../../core/services/emprunt.service';
import { AuthService } from '../../../core/services/auth.service';
import { Emprunt } from '../../../core/models/emprunt';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-mes-emprunts',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mes-emprunts.component.html',
  styleUrl: './mes-emprunts.component.css'
})
export class MesEmpruntsComponent implements OnInit {
  currentUser: User | null = null;
  empruntsEnCours: Emprunt[] = [];
  historique: Emprunt[] = [];
  loading = true;
  historiqueLoading = false;
  error = '';
  
  activeTab: 'en_cours' | 'historique' = 'en_cours';
  
  // Pagination pour l'historique
  currentPage = 1;
  lastPage = 1;
  total = 0;

  stats = {
    emprunts_en_cours: 0,
    quota_disponible: 0,
    emprunts_en_retard: 0,
    penalites_impayees: 0
  };

  constructor(
    private empruntService: EmpruntService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    this.loadEmpruntsEnCours();
  }

  loadEmpruntsEnCours() {
    this.loading = true;
    this.error = '';

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
        this.error = 'Erreur lors du chargement de vos emprunts';
        this.loading = false;
      }
    });
  }

  loadHistorique(page: number = 1) {
    this.historiqueLoading = true;

    this.empruntService.getHistorique(page).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.historique = response.data.data || [];
          this.currentPage = response.data.current_page || 1;
          this.lastPage = response.data.last_page || 1;
          this.total = response.data.total || 0;
        }
        this.historiqueLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement historique:', error);
        this.historiqueLoading = false;
      }
    });
  }

  changeTab(tab: 'en_cours' | 'historique') {
    this.activeTab = tab;
    
    if (tab === 'historique' && this.historique.length === 0) {
      this.loadHistorique();
    }
  }

  prolongerEmprunt(emprunt: Emprunt) {
    if (!emprunt.peut_etre_prolonge) {
      alert('Cet emprunt ne peut pas être prolongé');
      return;
    }

    const prolongationsRestantes = 2 - emprunt.nombre_prolongations;
    
    if (!confirm(`Voulez-vous prolonger cet emprunt de 7 jours ?\n${prolongationsRestantes} prolongation(s) restante(s).`)) {
      return;
    }

    this.empruntService.prolonger(emprunt.id).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Emprunt prolongé avec succès de 7 jours !');
          this.loadEmpruntsEnCours();
        }
      },
      error: (error) => {
        console.error('Erreur prolongation:', error);
        alert(error.error?.message || 'Erreur lors de la prolongation');
      }
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.lastPage) {
      this.loadHistorique(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getStatutClass(emprunt: Emprunt): string {
    if (emprunt.est_en_retard) return 'danger';
    if (emprunt.jours_restants !== undefined && emprunt.jours_restants <= 3) return 'warning';
    return 'success';
  }

  getStatutLabel(emprunt: Emprunt): string {
    if (emprunt.est_en_retard) {
      return `En retard de ${emprunt.jours_de_retard} jour(s)`;
    }
    if (emprunt.jours_restants !== undefined) {
      return `${emprunt.jours_restants} jour(s) restant(s)`;
    }
    return 'En cours';
  }

  getDefaultCover(titre: string): string {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    const index = titre.length % colors.length;
    return colors[index];
  }

  getProgressBarWidth(emprunt: Emprunt): number {
    if (!emprunt.jours_restants) return 0;
    
    const totalJours = 14; // Durée initiale d'emprunt
    const joursEcoules = totalJours - emprunt.jours_restants;
    const progress = (joursEcoules / totalJours) * 100;
    
    return Math.min(Math.max(progress, 0), 100);
  }

  getProgressBarColor(emprunt: Emprunt): string {
    if (emprunt.est_en_retard) return '#ef4444';
    if (emprunt.jours_restants !== undefined && emprunt.jours_restants <= 3) return '#f59e0b';
    return '#22c55e';
  }

  get totalEmprunts(): number {
    return this.empruntsEnCours.length;
  }

  get empruntsEnRetard(): number {
    return this.empruntsEnCours.filter(e => e.est_en_retard).length;
  }

  get hasEmprunts(): boolean {
    return this.empruntsEnCours.length > 0;
  }
}
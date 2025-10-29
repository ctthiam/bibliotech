// ============================================
// src/app/pages/lecteur/mes-penalites/mes-penalites.component.ts
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PenaliteService, Penalite, PenaliteStats } from '../../../core/services/penalite.service';

@Component({
  selector: 'app-mes-penalites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mes-penalites.component.html',
  styleUrl: './mes-penalites.component.css'
})
export class MesPenalitesComponent implements OnInit {
  penalites: Penalite[] = [];
  stats: PenaliteStats | null = null;
  loading = true;
  error = '';

  // Filtres
  activeTab: 'impayees' | 'payees' | 'toutes' = 'impayees';

  // Pagination
  currentPage = 1;
  totalPages = 1;
  perPage = 10;

  constructor(private penaliteService: PenaliteService) {}

  ngOnInit() {
    this.loadPenalites();
    this.loadStatistiques();
  }

  loadPenalites() {
    this.loading = true;
    
    const params: any = {
      page: this.currentPage,
      per_page: this.perPage
    };

    if (this.activeTab !== 'toutes') {
      params.statut = this.activeTab === 'impayees' ? 'impayee' : 'payee';
    }

    this.penaliteService.getPenalites(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.penalites = response.data.data || [];
          this.currentPage = response.data.current_page || 1;
          this.totalPages = response.data.last_page || 1;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement pénalités:', error);
        this.error = 'Impossible de charger les pénalités';
        this.loading = false;
      }
    });
  }

  loadStatistiques() {
    this.penaliteService.getStatistiques().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Erreur chargement statistiques:', error);
      }
    });
  }

  setActiveTab(tab: 'impayees' | 'payees' | 'toutes') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadPenalites();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPenalites();
    }
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'impayee': return 'status-impayee';
      case 'payee': return 'status-payee';
      case 'annulee': return 'status-annulee';
      default: return '';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'impayee': return 'Impayée';
      case 'payee': return 'Payée';
      case 'annulee': return 'Annulée';
      default: return statut;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  formatMontant(montant: number): string {
    return `${montant.toLocaleString('fr-FR')} FCFA`;
  }

  get penalitesFiltrees(): Penalite[] {
    return this.penalites;
  }

  get montantTotalImpaye(): number {
    return this.stats?.montant_total_impaye || 0;
  }

  get nombrePenalitesImpayees(): number {
    return this.stats?.penalites_impayees || 0;
  }
}
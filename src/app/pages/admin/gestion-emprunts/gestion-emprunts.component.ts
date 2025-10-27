// ============================================
// src/app/pages/admin/gestion-emprunts/gestion-emprunts.component.ts
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmpruntService } from '../../../core/services/emprunt.service';
import { Emprunt } from '../../../core/models/emprunt';

@Component({
  selector: 'app-gestion-emprunts',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './gestion-emprunts.component.html',
  styleUrl: './gestion-emprunts.component.css'
})
export class GestionEmpruntsComponent implements OnInit {
  emprunts: Emprunt[] = [];
  loading = true;
  error = '';

  // Filtres
  searchTerm = '';
  selectedStatut: string = 'tous';

  // Pagination
  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 15;

  // Modal
  showModal = false;
  modalMode: 'view' | 'retour' = 'view';
  selectedEmprunt: Emprunt | null = null;

  // Stats
  stats = {
    total_emprunts: 0,
    en_cours: 0,
    en_retard: 0,
    termines: 0
  };

  constructor(private empruntService: EmpruntService) {}

  ngOnInit() {
    this.loadEmprunts();
    this.loadStats();
  }

  loadEmprunts() {
    this.loading = true;
    this.error = '';

    const params: any = {
      page: this.currentPage,
      per_page: this.perPage
    };

    if (this.selectedStatut !== 'tous') {
      params.statut = this.selectedStatut;
    }

    this.empruntService.getAllEmprunts(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.emprunts = response.data.data || [];
          this.currentPage = response.data.current_page || 1;
          this.lastPage = response.data.last_page || 1;
          this.total = response.data.total || 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement emprunts:', error);
        this.error = 'Erreur lors du chargement des emprunts';
        this.loading = false;
      }
    });
  }

  loadStats() {
    this.empruntService.getStatistiques().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats.en_cours = response.data.emprunts_en_cours || 0;
          this.stats.en_retard = response.data.emprunts_en_retard || 0;
          this.stats.total_emprunts = response.data.total_emprunts || 0;
          this.stats.termines = this.stats.total_emprunts - this.stats.en_cours;
        }
      },
      error: (error) => {
        console.error('Erreur chargement stats:', error);
      }
    });
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadEmprunts();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatut = 'tous';
    this.currentPage = 1;
    this.loadEmprunts();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.lastPage) {
      this.currentPage = page;
      this.loadEmprunts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  voirDetails(emprunt: Emprunt) {
    this.selectedEmprunt = emprunt;
    this.modalMode = 'view';
    this.showModal = true;
  }

  confirmerRetour(emprunt: Emprunt) {
    this.selectedEmprunt = emprunt;
    this.modalMode = 'retour';
    this.showModal = true;
  }

  validerRetour() {
    if (!this.selectedEmprunt) return;

    this.empruntService.retourner(this.selectedEmprunt.id).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Retour validé avec succès !');
          this.closeModal();
          this.loadEmprunts();
          this.loadStats();
        }
      },
      error: (error) => {
        console.error('Erreur validation retour:', error);
        alert(error.error?.message || 'Erreur lors de la validation du retour');
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedEmprunt = null;
  }

  getStatutClass(emprunt: Emprunt): string {
    if (emprunt.statut === 'termine') return 'success';
    if (emprunt.est_en_retard) return 'danger';
    if (emprunt.jours_restants !== undefined && emprunt.jours_restants <= 3) return 'warning';
    return 'info';
  }

  getStatutLabel(emprunt: Emprunt): string {
    if (emprunt.statut === 'termine') return 'Terminé';
    if (emprunt.est_en_retard) return `En retard (${emprunt.jours_de_retard}j)`;
    if (emprunt.jours_restants !== undefined) return `${emprunt.jours_restants}j restant(s)`;
    return 'En cours';
  }

  getDefaultCover(titre: string): string {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    const index = titre.length % colors.length;
    return colors[index];
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.lastPage, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  get hasActiveFilters(): boolean {
    return this.selectedStatut !== 'tous';
  }

  get filteredEmprunts(): Emprunt[] {
    if (!this.searchTerm) return this.emprunts;
    
    const term = this.searchTerm.toLowerCase();
    return this.emprunts.filter(e => 
      e.livre.titre.toLowerCase().includes(term) ||
      e.livre.auteur.toLowerCase().includes(term) ||
      e.lecteur?.nom.toLowerCase().includes(term) ||
      e.lecteur?.prenom.toLowerCase().includes(term)
    );
  }
}
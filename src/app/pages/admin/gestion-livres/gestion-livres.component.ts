// ============================================
// src/app/pages/admin/gestion-livres/gestion-livres.component.ts
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LivreService } from '../../../core/services/livre.service';
import { Livre, Categorie } from '../../../core/models/livre';

@Component({
  selector: 'app-gestion-livres',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './gestion-livres.component.html',
  styleUrl: './gestion-livres.component.css'
})
export class GestionLivresComponent implements OnInit {
  livres: Livre[] = [];
  categories: Categorie[] = [];
  loading = true;
  error = '';

  // Filtres
  searchTerm = '';
  selectedCategorie: number | null = null;
  selectedDisponibilite: string = 'tous';

  // Pagination
  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 10;

  // Modal
  showModal = false;
  modalMode: 'view' | 'delete' = 'view';
  selectedLivre: Livre | null = null;

  // Stats
  stats = {
    total_livres: 0,
    livres_disponibles: 0,
    livres_empruntes: 0,
    categories_count: 0
  };

  constructor(
    private livreService: LivreService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadLivres();
    this.loadStats();
  }

  loadCategories() {
    this.livreService.getCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data;
        }
      },
      error: (error) => {
        console.error('Erreur chargement catégories:', error);
      }
    });
  }

  loadLivres() {
    this.loading = true;
    this.error = '';

    const params: any = {
      page: this.currentPage,
      per_page: this.perPage
    };

    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedCategorie) params.categorie_id = this.selectedCategorie;
    if (this.selectedDisponibilite !== 'tous') {
      params.disponible = this.selectedDisponibilite === 'disponibles';
    }

    this.livreService.getLivres(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.livres = response.data.data;
          this.currentPage = response.data.current_page;
          this.lastPage = response.data.last_page;
          this.total = response.data.total;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement livres:', error);
        this.error = 'Erreur lors du chargement des livres';
        this.loading = false;
      }
    });
  }

  loadStats() {
    // Les stats sont calculées côté client pour l'instant
    // Idéalement, créer une route API dédiée
    this.livreService.getLivres({ per_page: 1000 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const allLivres = response.data.data;
          this.stats.total_livres = allLivres.length;
          this.stats.livres_disponibles = allLivres.filter(l => l.est_disponible).length;
          this.stats.livres_empruntes = allLivres.filter(l => !l.est_disponible).length;
          this.stats.categories_count = this.categories.length;
        }
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadLivres();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadLivres();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategorie = null;
    this.selectedDisponibilite = 'tous';
    this.currentPage = 1;
    this.loadLivres();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.lastPage) {
      this.currentPage = page;
      this.loadLivres();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ajouterLivre() {
    this.router.navigate(['/admin/livres/nouveau']);
  }

  modifierLivre(livre: Livre) {
    this.router.navigate(['/admin/livres/modifier', livre.id]);
  }

  voirDetails(livre: Livre) {
    this.selectedLivre = livre;
    this.modalMode = 'view';
    this.showModal = true;
  }

  confirmerSuppression(livre: Livre) {
    this.selectedLivre = livre;
    this.modalMode = 'delete';
    this.showModal = true;
  }

  supprimerLivre() {
    if (!this.selectedLivre) return;

    this.livreService.deleteLivre(this.selectedLivre.id).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Livre supprimé avec succès !');
          this.closeModal();
          this.loadLivres();
          this.loadStats();
        }
      },
      error: (error) => {
        console.error('Erreur suppression:', error);
        alert(error.error?.message || 'Erreur lors de la suppression du livre');
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedLivre = null;
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
    return !!(this.searchTerm || this.selectedCategorie || this.selectedDisponibilite !== 'tous');
  }

  getCategorieNom(id?: number): string {
    if (!id) return 'Non classé';
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.nom : 'Non classé';
  }
}
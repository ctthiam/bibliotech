// ============================================
// src/app/pages/livres/liste-livres/liste-livres.component.ts
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LivreService } from '../../../core/services/livre.service';
import { Livre, Categorie } from '../../../core/models/livre';

@Component({
  selector: 'app-liste-livres',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './liste-livres.component.html',
  styleUrl: './liste-livres.component.css'
})
export class ListeLivresComponent implements OnInit {
  livres: Livre[] = [];
  categories: Categorie[] = [];
  loading = true;
  error = '';

  // Filtres
  searchTerm = '';
  selectedCategorie: number | null = null;
  disponibleOnly = false;

  // Pagination
  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 12;

  // Vue (grid ou list)
  viewMode: 'grid' | 'list' = 'grid';

  constructor(private livreService: LivreService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadLivres();
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

    const params = {
      page: this.currentPage,
      per_page: this.perPage,
      search: this.searchTerm || undefined,
      categorie_id: this.selectedCategorie || undefined,
      disponible: this.disponibleOnly || undefined
    };

    this.livreService.getLivres(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.livres = response.data.data;
          this.currentPage = response.data.current_page;
          this.lastPage = response.data.last_page;
          this.total = response.data.total;
          this.perPage = response.data.per_page;
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
    this.disponibleOnly = false;
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

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
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
    return !!(this.searchTerm || this.selectedCategorie || this.disponibleOnly);
  }

  get resultText(): string {
    if (this.total === 0) return 'Aucun livre trouvé';
    if (this.total === 1) return '1 livre trouvé';
    return `${this.total} livres trouvés`;
  }
}
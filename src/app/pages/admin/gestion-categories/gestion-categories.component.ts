// ============================================
// src/app/pages/admin/gestion-categories/gestion-categories.component.ts
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // ⬅️ AJOUTEZ CETTE LIGNE
import { LivreService } from '../../../core/services/livre.service';
import { Categorie } from '../../../core/models/livre'; // ⬅️ AJOUTEZ CETTE LIGNE

@Component({
  selector: 'app-gestion-categories',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './gestion-categories.component.html',
  styleUrl: './gestion-categories.component.css'
})
export class GestionCategoriesComponent implements OnInit {
  categories: Categorie[] = [];
  loading = true;
  error = '';
  
  // Modal
  showModal = false;
  showDeleteModal = false;
  modalMode: 'create' | 'edit' = 'create';
  categorieForm: FormGroup;
  selectedCategorie: Categorie | null = null;
  submitting = false;

  // Recherche et filtres
  searchTerm = '';
  sortBy: 'nom' | 'livres_count' | 'created_at' = 'nom';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Statistiques
  stats = {
    total_categories: 0,
    total_livres: 0,
    categorie_plus_populaire: '',
    moyenne_livres: 0
  };

  constructor(
    private fb: FormBuilder,
    private livreService: LivreService
  ) {
    this.categorieForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.livreService.getCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data;
          this.calculateStats();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement catégories:', error);
        this.error = 'Impossible de charger les catégories';
        this.loading = false;
      }
    });
  }

  calculateStats() {
    this.stats.total_categories = this.categories.length;
    this.stats.total_livres = this.categories.reduce((sum, cat) => sum + (cat.livres_count || 0), 0);
    
    const populaire = this.categories.reduce((max, cat) => 
      (cat.livres_count || 0) > (max.livres_count || 0) ? cat : max
    , this.categories[0]);
    
    this.stats.categorie_plus_populaire = populaire?.nom || '-';
    this.stats.moyenne_livres = this.stats.total_categories > 0 
      ? Math.round(this.stats.total_livres / this.stats.total_categories) 
      : 0;
  }

  get filteredCategories(): Categorie[] {
    let filtered = [...this.categories];

    // Recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(cat => 
        cat.nom.toLowerCase().includes(term) ||
        cat.description?.toLowerCase().includes(term)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (this.sortBy === 'nom') {
        comparison = a.nom.localeCompare(b.nom);
      } else if (this.sortBy === 'livres_count') {
        comparison = (a.livres_count || 0) - (b.livres_count || 0);
      } else if (this.sortBy === 'created_at') {
        comparison = new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  // Modal Actions
  openCreateModal() {
    this.modalMode = 'create';
    this.categorieForm.reset();
    this.showModal = true;
  }

  openEditModal(categorie: Categorie) {
    this.modalMode = 'edit';
    this.selectedCategorie = categorie;
    this.categorieForm.patchValue({
      nom: categorie.nom,
      description: categorie.description
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.categorieForm.reset();
    this.selectedCategorie = null;
  }

  openDeleteModal(categorie: Categorie) {
    this.selectedCategorie = categorie;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedCategorie = null;
  }

  // CRUD Operations
  submitForm() {
    if (this.categorieForm.invalid) {
      Object.keys(this.categorieForm.controls).forEach(key => {
        this.categorieForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    const formData = this.categorieForm.value;

    if (this.modalMode === 'create') {
      this.createCategorie(formData);
    } else {
      this.updateCategorie(formData);
    }
  }

  createCategorie(data: any) {
    this.livreService.createCategorie(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCategories();
          this.closeModal();
          alert('Catégorie créée avec succès !');
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Erreur création:', error);
        this.error = error.error?.message || 'Erreur lors de la création';
        this.submitting = false;
      }
    });
  }

  updateCategorie(data: any) {
    if (!this.selectedCategorie) return;

    this.livreService.updateCategorie(this.selectedCategorie.id, data).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCategories();
          this.closeModal();
          alert('Catégorie modifiée avec succès !');
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Erreur modification:', error);
        this.error = error.error?.message || 'Erreur lors de la modification';
        this.submitting = false;
      }
    });
  }

  confirmDelete() {
    if (!this.selectedCategorie) return;

    this.livreService.deleteCategorie(this.selectedCategorie.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCategories();
          this.closeDeleteModal();
          alert('Catégorie supprimée avec succès !');
        }
      },
      error: (error) => {
        console.error('Erreur suppression:', error);
        alert(error.error?.message || 'Impossible de supprimer cette catégorie (elle contient peut-être des livres)');
        this.closeDeleteModal();
      }
    });
  }

  // Helpers
  isFieldInvalid(field: string): boolean {
    const control = this.categorieForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(field: string): string {
    const control = this.categorieForm.get(field);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'Ce champ est requis';
    if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} caractères`;
    if (control.errors['maxlength']) return `Maximum ${control.errors['maxlength'].requiredLength} caractères`;

    return 'Champ invalide';
  }

  changeSortBy(field: 'nom' | 'livres_count' | 'created_at') {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
  }

  getCategorieColor(index: number): string {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    ];
    return colors[index % colors.length];
  }
}
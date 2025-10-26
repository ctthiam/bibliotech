// ============================================
// src/app/pages/admin/form-livre/form-livre.component.ts
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LivreService } from '../../../core/services/livre.service';
import { Categorie, CreateLivreRequest } from '../../../core/models/livre';

@Component({
  selector: 'app-form-livre',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './form-livre.component.html',
  styleUrl: './form-livre.component.css'
})
export class FormLivreComponent implements OnInit {
  livreForm!: FormGroup;
  categories: Categorie[] = [];
  isEditMode = false;
  livreId: number | null = null;
  loading = false;
  submitting = false;
  error = '';
  
  // Preview de l'image
  imagePreview: string | null = null;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private livreService: LivreService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadCategories();
    
    // Vérifier si mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.livreId = +params['id'];
        this.loadLivre(this.livreId);
      }
    });
  }

  initForm() {
    this.livreForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      auteur: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      isbn: ['', [Validators.required, Validators.pattern(/^[0-9-]{10,17}$/)]],
      editeur: ['', [Validators.maxLength(255)]],
      annee_publication: ['', [Validators.min(1000), Validators.max(this.currentYear)]],
      nombre_pages: ['', [Validators.min(1)]],
      langue: ['Français'],
      categorie_id: [null],
      resume: ['', [Validators.maxLength(2000)]],
      image_couverture: [''],
      nombre_exemplaires: [1, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
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

  loadLivre(id: number) {
    this.loading = true;
    this.error = '';

    this.livreService.getLivre(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const livre = response.data;
          
          this.livreForm.patchValue({
            titre: livre.titre,
            auteur: livre.auteur,
            isbn: livre.isbn,
            editeur: livre.editeur || '',
            annee_publication: livre.annee_publication || '',
            nombre_pages: livre.nombre_pages || '',
            langue: livre.langue || 'Français',
            categorie_id: livre.categorie?.id || null,
            resume: livre.resume || '',
            image_couverture: livre.image_couverture || '',
            nombre_exemplaires: livre.nombre_exemplaires || 1
          });

          // Prévisualisation de l'image existante
          if (livre.image_couverture) {
            this.imagePreview = livre.image_couverture;
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement livre:', error);
        this.error = 'Erreur lors du chargement du livre';
        this.loading = false;
      }
    });
  }

  onImageUrlChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const url = input.value;
    
    if (url) {
      this.imagePreview = url;
    } else {
      this.imagePreview = null;
    }
  }

  onSubmit() {
    if (this.livreForm.invalid) {
      this.markFormGroupTouched(this.livreForm);
      return;
    }

    this.submitting = true;
    this.error = '';

    const formData: CreateLivreRequest = {
      titre: this.livreForm.value.titre,
      auteur: this.livreForm.value.auteur,
      isbn: this.livreForm.value.isbn,
      editeur: this.livreForm.value.editeur || undefined,
      annee_publication: this.livreForm.value.annee_publication || undefined,
      nombre_pages: this.livreForm.value.nombre_pages || undefined,
      langue: this.livreForm.value.langue || undefined,
      categorie_id: this.livreForm.value.categorie_id || undefined,
      resume: this.livreForm.value.resume || undefined,
      image_couverture: this.livreForm.value.image_couverture || undefined,
      nombre_exemplaires: this.livreForm.value.nombre_exemplaires
    };

    if (this.isEditMode && this.livreId) {
      // Mode édition
      this.livreService.updateLivre(this.livreId, formData).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Livre modifié avec succès !');
            this.router.navigate(['/admin/livres']);
          }
          this.submitting = false;
        },
        error: (error) => {
          console.error('Erreur modification:', error);
          this.error = error.error?.message || 'Erreur lors de la modification du livre';
          this.submitting = false;
        }
      });
    } else {
      // Mode création
      this.livreService.createLivre(formData).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Livre ajouté avec succès !');
            this.router.navigate(['/admin/livres']);
          }
          this.submitting = false;
        },
        error: (error) => {
          console.error('Erreur création:', error);
          this.error = error.error?.message || 'Erreur lors de la création du livre';
          this.submitting = false;
        }
      });
    }
  }

  onCancel() {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications non enregistrées seront perdues.')) {
      this.router.navigate(['/admin/livres']);
    }
  }

  // Helper pour marquer tous les champs comme touchés
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters pour faciliter l'accès aux erreurs dans le template
  get titre() { return this.livreForm.get('titre'); }
  get auteur() { return this.livreForm.get('auteur'); }
  get isbn() { return this.livreForm.get('isbn'); }
  get editeur() { return this.livreForm.get('editeur'); }
  get annee_publication() { return this.livreForm.get('annee_publication'); }
  get nombre_pages() { return this.livreForm.get('nombre_pages'); }
  get langue() { return this.livreForm.get('langue'); }
  get categorie_id() { return this.livreForm.get('categorie_id'); }
  get resume() { return this.livreForm.get('resume'); }
  get image_couverture() { return this.livreForm.get('image_couverture'); }
  get nombre_exemplaires() { return this.livreForm.get('nombre_exemplaires'); }

  // Helper pour afficher les erreurs
  getErrorMessage(controlName: string): string {
    const control = this.livreForm.get(controlName);
    
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    const errors = control.errors;
    
    if (errors['required']) return 'Ce champ est requis';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} caractères`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    if (errors['min']) return `Valeur minimale : ${errors['min'].min}`;
    if (errors['max']) return `Valeur maximale : ${errors['max'].max}`;
    if (errors['pattern']) return 'Format invalide';
    
    return 'Champ invalide';
  }

  getDefaultCover(titre: string): string {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    const index = titre.length % colors.length;
    return colors[index];
  }
}
// ============================================
// src/app/core/models/livre.ts
// ============================================

export interface Livre {
  id: number;
  titre: string;
  auteur: string;
  isbn: string;
  editeur?: string;
  annee_publication?: number;
  nombre_pages?: number;
  langue?: string;
  resume?: string;
  image_couverture?: string;
  categorie?: Categorie;
  nombre_exemplaires?: number;
  exemplaires_disponibles?: number;
  est_disponible?: boolean;
  created_at?: string;
}

export interface Categorie {
  id: number;
  nom: string;
  description?: string;
  livres_count?: number;
}

export interface CreateLivreRequest {
  titre: string;
  auteur: string;
  isbn: string;
  editeur?: string;
  annee_publication?: number;
  nombre_pages?: number;
  langue?: string;
  categorie_id?: number;
  resume?: string;
  image_couverture?: string;
  nombre_exemplaires: number;
}

export interface UpdateLivreRequest extends Partial<CreateLivreRequest> {}
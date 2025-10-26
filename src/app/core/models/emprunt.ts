// ============================================
// src/app/core/models/emprunt.ts
// ============================================
export interface Emprunt {
  id: number;
  lecteur?: {
    id: number;
    nom: string;
    prenom: string;
    numero_carte: string;
  };
  livre: {
    id: number;
    titre: string;
    auteur: string;
    image_couverture?: string;
  };
  exemplaire?: {
    id: number;
    numero_exemplaire: string;
  };
  date_emprunt: string;
  date_retour_prevue: string;
  date_retour_effective?: string;
  statut: 'en_cours' | 'termine' | 'en_retard';
  nombre_prolongations: number;
  jours_restants?: number;
  est_en_retard?: boolean;
  jours_de_retard?: number;
  peut_etre_prolonge?: boolean;
  created_at?: string;
}

export interface EmpruntRequest {
  exemplaire_id: number;
}

export interface EmpruntResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: any;
}

export interface MesEmpruntsResponse {
  success: boolean;
  data: {
    emprunts: Emprunt[];
    total: number;
    quota: number;
  };
}


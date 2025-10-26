// ============================================
// src/app/core/models/user.ts
// ============================================
export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'lecteur' | 'bibliothecaire' | 'administrateur';
  lecteur?: Lecteur;
  created_at?: string;
}

export interface Lecteur {
  id?: number;
  numero_carte: string;
  date_naissance?: string;
  statut: 'actif' | 'suspendu' | 'bloque';
  quota_emprunt: number;
  emprunts_en_cours?: number;
  penalites_impayees?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  password_confirmation: string;
  telephone?: string;
  date_naissance: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    token_type: string;
    expires_in?: number;
  };
}

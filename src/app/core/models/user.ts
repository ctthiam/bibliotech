// src/app/core/models/user.ts
export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'lecteur' | 'bibliothecaire' | 'administrateur';
  date_creation?: string; // AJOUTÉ
  created_at?: string;
  lecteur?: Lecteur;
  bibliothecaire?: Bibliothecaire; // AJOUTÉ
  administrateur?: Administrateur; // AJOUTÉ
}

export interface Lecteur {
  id: number;
  numero_carte: string;
  date_naissance: string;
  statut: 'actif' | 'suspendu' | 'bloque';
  quota_emprunt: number;
  penalites_impayees?: number;
}

export interface Bibliothecaire {
  id: number;
  service: string;
  autorisations: string[];
}

export interface Administrateur {
  id: number;
  privileges: string[];
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
  telephone: string;
  date_naissance: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    token: string;
  };
  errors?: any;
}
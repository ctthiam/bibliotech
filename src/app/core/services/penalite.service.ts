// ============================================
// src/app/core/services/penalite.service.ts
// Créez ce fichier
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response';

export interface Penalite {
  id: number;
  lecteur_id: number;
  emprunt_id: number;
  montant: number;
  motif: string;
  date_creation: string;
  date_paiement: string | null;
  statut: 'impayee' | 'payee' | 'annulee';
  lecteur?: any;
  emprunt?: any;
  created_at: string;
}

export interface PenaliteStats {
  total_penalites: number;
  penalites_impayees: number;
  penalites_payees?: number;
  penalites_annulees?: number;
  montant_total_impaye: number;
  montant_total_paye: number;
  montant_total?: number;
  derniere_penalite?: Penalite;
  top_lecteurs_penalites?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class PenaliteService {
  private apiUrl = `${environment.apiUrl}/penalites`;

  constructor(private http: HttpClient) {}

  // Lister les pénalités
  getPenalites(params?: any): Observable<ApiResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<ApiResponse<any>>(this.apiUrl, { params: httpParams });
  }

  // Détails d'une pénalité
  getPenalite(id: number): Observable<ApiResponse<Penalite>> {
    return this.http.get<ApiResponse<Penalite>>(`${this.apiUrl}/${id}`);
  }

  // Marquer comme payée
  marquerPayee(id: number): Observable<ApiResponse<Penalite>> {
    return this.http.post<ApiResponse<Penalite>>(`${this.apiUrl}/${id}/payer`, {});
  }

  // Annuler une pénalité
  annuler(id: number): Observable<ApiResponse<Penalite>> {
    return this.http.post<ApiResponse<Penalite>>(`${this.apiUrl}/${id}/annuler`, {});
  }

  // Statistiques
  getStatistiques(): Observable<ApiResponse<PenaliteStats>> {
    return this.http.get<ApiResponse<PenaliteStats>>(`${this.apiUrl}/statistiques`);
  }

  // Calculer les pénalités (Admin)
  calculerPenalites(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/calculer`, {});
  }
}
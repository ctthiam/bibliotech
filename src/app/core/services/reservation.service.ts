// ============================================
// src/app/core/services/reservation.service.ts
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response';

export interface Reservation {
  id: number;
  lecteur_id: number;
  livre_id: number;
  date_reservation: string;
  statut: 'en_attente' | 'disponible' | 'expiree' | 'annulee';
  lecteur?: any;
  livre?: any;
  created_at: string;
}

export interface ReservationStats {
  total_reservations: number;
  reservations_en_attente: number;
  reservations_disponibles: number;
  reservations_expirees: number;
  reservations_annulees: number;
  livres_plus_reserves?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  // Lister les réservations
  getReservations(params?: any): Observable<ApiResponse<any>> {
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

  // Détails d'une réservation
  getReservation(id: number): Observable<ApiResponse<Reservation>> {
    return this.http.get<ApiResponse<Reservation>>(`${this.apiUrl}/${id}`);
  }

  // Créer une réservation
  creerReservation(livreId: number): Observable<ApiResponse<Reservation>> {
    return this.http.post<ApiResponse<Reservation>>(this.apiUrl, { livre_id: livreId });
  }

  // Annuler une réservation
  annulerReservation(id: number): Observable<ApiResponse<Reservation>> {
    return this.http.post<ApiResponse<Reservation>>(`${this.apiUrl}/${id}/annuler`, {});
  }

  // Marquer comme disponible (Admin)
  marquerDisponible(id: number): Observable<ApiResponse<Reservation>> {
    return this.http.post<ApiResponse<Reservation>>(`${this.apiUrl}/${id}/disponible`, {});
  }

  // Marquer comme expirée (Admin)
  marquerExpiree(id: number): Observable<ApiResponse<Reservation>> {
    return this.http.post<ApiResponse<Reservation>>(`${this.apiUrl}/${id}/expirer`, {});
  }

  // Statistiques
  getStatistiques(): Observable<ApiResponse<ReservationStats>> {
    return this.http.get<ApiResponse<ReservationStats>>(`${this.apiUrl}/statistiques`);
  }
}
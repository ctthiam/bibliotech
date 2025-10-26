// ============================================
// src/app/core/services/emprunt.service.ts
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Emprunt, 
  EmpruntRequest, 
  EmpruntResponse, 
  MesEmpruntsResponse 
} from '../models/emprunt';

@Injectable({
  providedIn: 'root'
})
export class EmpruntService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  emprunter(data: EmpruntRequest): Observable<EmpruntResponse> {
    return this.http.post<EmpruntResponse>(`${this.apiUrl}/emprunts`, data);
  }

  getMesEmprunts(): Observable<MesEmpruntsResponse> {
    return this.http.get<MesEmpruntsResponse>(`${this.apiUrl}/mes-emprunts`);
  }

  getHistorique(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/historique-emprunts?page=${page}`);
  }

  prolonger(empruntId: number): Observable<EmpruntResponse> {
    return this.http.post<EmpruntResponse>(`${this.apiUrl}/emprunts/${empruntId}/prolonger`, {});
  }

  retourner(empruntId: number): Observable<EmpruntResponse> {
    return this.http.post<EmpruntResponse>(`${this.apiUrl}/emprunts/${empruntId}/retourner`, {});
  }

  getAllEmprunts(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/emprunts`, { params });
  }

  getStatistiques(): Observable<any> {
    return this.http.get(`${this.apiUrl}/emprunts/statistiques`);
  }
}
// ============================================
// src/app/core/services/livre.service.ts
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Livre, CreateLivreRequest, Categorie } from '../models/livre';
import { ApiResponse, PaginatedResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class LivreService {
  private apiUrl = `${environment.apiUrl}/livres`;
  private categoriesUrl = `${environment.apiUrl}/categories`; // ✅ URL séparée

  constructor(private http: HttpClient) {}

  getLivres(params?: {
    search?: string;
    categorie_id?: number;
    disponible?: boolean;
    page?: number;
    per_page?: number;
  }): Observable<PaginatedResponse<Livre>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.categorie_id) httpParams = httpParams.set('categorie_id', params.categorie_id.toString());
      if (params.disponible !== undefined) httpParams = httpParams.set('disponible', params.disponible.toString());
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
    }
    
    return this.http.get<PaginatedResponse<Livre>>(this.apiUrl, { params: httpParams });
  }

  getLivre(id: number): Observable<ApiResponse<Livre>> {
    return this.http.get<ApiResponse<Livre>>(`${this.apiUrl}/${id}`);
  }

  createLivre(data: CreateLivreRequest): Observable<ApiResponse<Livre>> {
    return this.http.post<ApiResponse<Livre>>(this.apiUrl, data);
  }

  updateLivre(id: number, data: Partial<CreateLivreRequest>): Observable<ApiResponse<Livre>> {
    return this.http.put<ApiResponse<Livre>>(`${this.apiUrl}/${id}`, data);
  }

  deleteLivre(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getLivresPopulaires(): Observable<ApiResponse<Livre[]>> {
    return this.http.get<ApiResponse<Livre[]>>(`${this.apiUrl}/populaires`);
  }

  getNouveauxLivres(): Observable<ApiResponse<Livre[]>> {
    return this.http.get<ApiResponse<Livre[]>>(`${this.apiUrl}/nouveaux`);
  }

  // ✅ MÉTHODES CATÉGORIES CORRIGÉES
  getCategories(): Observable<ApiResponse<Categorie[]>> {
    return this.http.get<ApiResponse<Categorie[]>>(this.categoriesUrl);
  }

  createCategorie(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.categoriesUrl, data);
  }

  updateCategorie(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.categoriesUrl}/${id}`, data);
  }

  deleteCategorie(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.categoriesUrl}/${id}`);
  }
}
// ============================================
// src/app/core/services/notification.service.ts
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response';

export interface Notification {
  id: number;
  destinataire_id: number;
  type: 'rappel' | 'retard' | 'disponibilite' | 'information';
  titre: string;
  contenu: string;
  donnees: any;
  lu: boolean;
  date_lecture: string | null;
  date_envoi: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  
  // BehaviorSubject pour le nombre de notifications non lues
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Charger le compte initial
    this.loadUnreadCount();
    
    // Rafraîchir toutes les 30 secondes
    interval(30000).pipe(
      switchMap(() => this.getUnreadCount())
    ).subscribe();
  }

  // Lister les notifications
  getNotifications(params?: any): Observable<ApiResponse<any>> {
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

  // Nombre de notifications non lues
  getUnreadCount(): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.apiUrl}/non-lues`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.unreadCountSubject.next(response.data.count);
        }
      })
    );
  }

  // Charger le compte de notifications non lues
  loadUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }

  // Marquer une notification comme lue
  markAsRead(id: number): Observable<ApiResponse<Notification>> {
    return this.http.post<ApiResponse<Notification>>(`${this.apiUrl}/${id}/lue`, {}).pipe(
      tap(() => {
        // Décrémenter le compteur
        const currentCount = this.unreadCountSubject.value;
        if (currentCount > 0) {
          this.unreadCountSubject.next(currentCount - 1);
        }
      })
    );
  }

  // Marquer toutes comme lues
  markAllAsRead(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/marquer-toutes-lues`, {}).pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
      })
    );
  }

  // Supprimer une notification
  deleteNotification(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  // Helpers
  getTypeIcon(type: string): string {
    switch (type) {
      case 'rappel': return '🔔';
      case 'retard': return '⚠️';
      case 'disponibilite': return '🎉';
      case 'information': return 'ℹ️';
      default: return '📬';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'rappel': return 'blue';
      case 'retard': return 'red';
      case 'disponibilite': return 'green';
      case 'information': return 'purple';
      default: return 'gray';
    }
  }
}
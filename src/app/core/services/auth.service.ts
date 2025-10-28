// ============================================
// src/app/core/services/auth.service.ts
// ============================================
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.saveAuthData(response.data.token, response.data.user);
          }
        })
      );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.saveAuthData(response.data.token, response.data.user);
          }
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => {
          this.clearAuthData();
        })
      );
  }

  getProfile(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/auth/profile`);
  }

  // Mettre à jour le profil
  updateProfile(data: any): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/auth/profile`, data).pipe(
      tap((response) => {
        if (response.success && response.data?.user) {
          // Mettre à jour l'utilisateur dans le BehaviorSubject
          this.currentUserSubject.next(response.data.user);
          // Mettre à jour dans le localStorage
          localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        }
      })
    );
  }

  // Changer le mot de passe
  changePassword(data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/auth/change-password`, data);
  }

  private saveAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLecteur(): boolean {
    return this.currentUserValue?.role === 'lecteur';
  }

  isBibliothecaire(): boolean {
    return this.currentUserValue?.role === 'bibliothecaire';
  }

  isAdministrateur(): boolean {
    return this.currentUserValue?.role === 'administrateur';
  }
}
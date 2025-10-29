// ============================================
// src/app/pages/lecteur/mes-reservations/mes-reservations.component.ts
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationService, Reservation, ReservationStats } from '../../../core/services/reservation.service';

@Component({
  selector: 'app-mes-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mes-reservations.component.html',
  styleUrl: './mes-reservations.component.css'
})
export class MesReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  stats: ReservationStats | null = null;
  loading = true;
  error = '';

  // Filtres
  activeTab: 'en_attente' | 'disponibles' | 'toutes' = 'en_attente';

  // Pagination
  currentPage = 1;
  totalPages = 1;
  perPage = 10;

  constructor(private reservationService: ReservationService) {}

  ngOnInit() {
    this.loadReservations();
    this.loadStatistiques();
  }

  loadReservations() {
    this.loading = true;
    
    const params: any = {
      page: this.currentPage,
      per_page: this.perPage
    };

    if (this.activeTab !== 'toutes') {
      params.statut = this.activeTab === 'en_attente' ? 'en_attente' : 'disponible';
    }

    this.reservationService.getReservations(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.reservations = response.data.data || [];
          this.currentPage = response.data.current_page || 1;
          this.totalPages = response.data.last_page || 1;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement réservations:', error);
        this.error = 'Impossible de charger les réservations';
        this.loading = false;
      }
    });
  }

  loadStatistiques() {
    this.reservationService.getStatistiques().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
        }
      },
      error: (error) => {
        console.error('Erreur chargement statistiques:', error);
      }
    });
  }

  setActiveTab(tab: 'en_attente' | 'disponibles' | 'toutes') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadReservations();
  }

  annulerReservation(reservation: Reservation) {
    if (!confirm(`Voulez-vous vraiment annuler la réservation de "${reservation.livre?.titre}" ?`)) {
      return;
    }

    this.reservationService.annulerReservation(reservation.id).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Réservation annulée avec succès !');
          this.loadReservations();
          this.loadStatistiques();
        }
      },
      error: (error) => {
        console.error('Erreur annulation:', error);
        alert(error.error?.message || 'Erreur lors de l\'annulation');
      }
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadReservations();
    }
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'en_attente': return 'status-attente';
      case 'disponible': return 'status-disponible';
      case 'expiree': return 'status-expiree';
      case 'annulee': return 'status-annulee';
      default: return '';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'disponible': return 'Disponible';
      case 'expiree': return 'Expirée';
      case 'annulee': return 'Annulée';
      default: return statut;
    }
  }

  getStatusIcon(statut: string): string {
    switch (statut) {
      case 'en_attente': return '⏳';
      case 'disponible': return '✅';
      case 'expiree': return '⏰';
      case 'annulee': return '❌';
      default: return '📋';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  getPositionFile(reservation: Reservation): number {
    // TODO: Calculer la vraie position dans la file d'attente
    return Math.floor(Math.random() * 5) + 1;
  }

  get nombreEnAttente(): number {
    return this.stats?.reservations_en_attente || 0;
  }

  get nombreDisponibles(): number {
    return this.stats?.reservations_disponibles || 0;
  }
}
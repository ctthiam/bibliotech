// ============================================
// src/app/pages/admin/statistiques/statistiques.component.ts
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmpruntService } from '../../../core/services/emprunt.service';
import { LivreService } from '../../../core/services/livre.service';

interface MonthData {
  month: string;
  emprunts: number;
  retours: number;
}

interface CategoryData {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './statistiques.component.html',
  styleUrl: './statistiques.component.css'
})
export class StatistiquesComponent implements OnInit {
  loading = true;
  error = '';
  
  // Statistiques globales
  stats = {
    total_livres: 245,
    total_emprunts: 1456,
    total_utilisateurs: 89,
    taux_occupation: 68,
    emprunts_mois: 156,
    croissance: 12.5,
    livres_populaires: 15,
    nouveaux_lecteurs: 8,
    emprunts_en_cours: 0
  };

  // Données pour les graphiques
  monthlyData: MonthData[] = [
    { month: 'Jan', emprunts: 120, retours: 115 },
    { month: 'Fév', emprunts: 145, retours: 138 },
    { month: 'Mar', emprunts: 162, retours: 155 },
    { month: 'Avr', emprunts: 138, retours: 142 },
    { month: 'Mai', emprunts: 175, retours: 168 },
    { month: 'Juin', emprunts: 192, retours: 185 },
    { month: 'Juil', emprunts: 158, retours: 162 },
    { month: 'Août', emprunts: 142, retours: 148 },
    { month: 'Sep', emprunts: 165, retours: 160 },
    { month: 'Oct', emprunts: 156, retours: 152 }
  ];

  categoryData: CategoryData[] = [
    { name: 'Romans', count: 85, percentage: 35, color: '#667eea' },
    { name: 'Sciences', count: 62, percentage: 25, color: '#764ba2' },
    { name: 'Histoire', count: 48, percentage: 20, color: '#f093fb' },
    { name: 'Jeunesse', count: 36, percentage: 15, color: '#4facfe' },
    { name: 'Autres', count: 14, percentage: 5, color: '#43e97b' }
  ];

  topLivres = [
    { titre: 'Le Petit Prince', auteur: 'Saint-Exupéry', emprunts: 45, trend: 'up' },
    { titre: 'Une si longue lettre', auteur: 'Mariama Bâ', emprunts: 38, trend: 'up' },
    { titre: 'L\'Aventure ambiguë', auteur: 'Cheikh Hamidou Kane', emprunts: 32, trend: 'down' },
    { titre: '1984', auteur: 'George Orwell', emprunts: 28, trend: 'up' },
    { titre: 'Les Misérables', auteur: 'Victor Hugo', emprunts: 25, trend: 'stable' }
  ];

  constructor(
    private empruntService: EmpruntService,
    private livreService: LivreService
  ) {}

  ngOnInit() {
    this.loadStatistiques();
  }

  loadStatistiques() {
    this.loading = true;

    // Charger les vraies stats depuis l'API
    this.empruntService.getStatistiques().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats.emprunts_en_cours = response.data.emprunts_en_cours || 0;
          this.stats.total_emprunts = response.data.total_emprunts || 0;
        }
      },
      error: (error) => {
        console.error('Erreur stats emprunts:', error);
      }
    });

    this.livreService.getLivres({ per_page: 1000 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats.total_livres = response.data.data.length;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur stats livres:', error);
        this.loading = false;
      }
    });
  }

  getMaxValue(): number {
    const allValues = this.monthlyData.flatMap(d => [d.emprunts, d.retours]);
    return Math.max(...allValues);
  }

  getBarHeight(value: number): number {
    return (value / this.getMaxValue()) * 100;
  }

  // Méthode pour calculer le stroke-dashoffset du donut chart
  getStrokeDashOffset(index: number): number {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += this.categoryData[i].percentage;
    }
    return -(offset * 5.03);
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  }

  getTrendClass(trend: string): string {
    switch (trend) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      case 'stable': return 'trend-stable';
      default: return 'trend-stable';
    }
  }

  get totalCategories(): number {
    return this.categoryData.reduce((sum, cat) => sum + cat.count, 0);
  }
}
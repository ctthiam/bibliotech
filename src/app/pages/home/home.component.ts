// ============================================
// src/app/pages/home/home.component.ts
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LivreService } from '../../core/services/livre.service';
import { AuthService } from '../../core/services/auth.service';
import { Livre } from '../../core/models/livre';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  livresPopulaires: Livre[] = [];
  nouveauxLivres: Livre[] = [];
  loading = true;

  stats = {
    total_livres: 5000,
    lecteurs_actifs: 2500,
    emprunts_mois: 1200
  };

  features = [
    {
      icon: '📚',
      title: 'Large Catalogue',
      description: 'Accédez à plus de 5 000 ouvrages dans tous les domaines'
    },
    {
      icon: '📱',
      title: 'Accès Mobile',
      description: 'Gérez vos emprunts depuis votre smartphone ou tablette'
    },
    {
      icon: '🔔',
      title: 'Notifications',
      description: 'Recevez des rappels automatiques avant les dates de retour'
    },
    {
      icon: '⚡',
      title: 'Emprunt Rapide',
      description: 'Réservez et empruntez vos livres en quelques clics'
    }
  ];

  testimonials = [
    {
      name: 'Amadou Diop',
      role: 'Étudiant',
      avatar: 'AD',
      comment: 'BiblioTech a révolutionné ma façon d\'accéder aux livres. C\'est simple, rapide et efficace !',
      rating: 5
    },
    {
      name: 'Fatou Ndiaye',
      role: 'Enseignante',
      avatar: 'FN',
      comment: 'Une plateforme excellente ! Les notifications me permettent de ne jamais oublier mes retours.',
      rating: 5
    },
    {
      name: 'Moussa Sall',
      role: 'Chercheur',
      avatar: 'MS',
      comment: 'Le catalogue est très riche et la recherche est intuitive. Je recommande vivement !',
      rating: 5
    }
  ];

  constructor(
    private livreService: LivreService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadLivres();
  }

  loadLivres() {
    // Charger les livres populaires
    this.livreService.getLivresPopulaires().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.livresPopulaires = response.data.slice(0, 6);
        }
      },
      error: (error) => {
        console.error('Erreur chargement livres populaires:', error);
      }
    });

    // Charger les nouveaux livres
    this.livreService.getNouveauxLivres().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.nouveauxLivres = response.data.slice(0, 6);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement nouveaux livres:', error);
        this.loading = false;
      }
    });
  }

  getDefaultCover(titre: string): string {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
    const index = titre.length % colors.length;
    return colors[index];
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
// ============================================
// src/app/pages/livres/detail-livre/detail-livre.component.ts
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LivreService } from '../../../core/services/livre.service';
import { EmpruntService } from '../../../core/services/emprunt.service';
import { AuthService } from '../../../core/services/auth.service';
import { Livre } from '../../../core/models/livre';
import { EmpruntRequest } from '../../../core/models/emprunt';

@Component({
  selector: 'app-detail-livre',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail-livre.component.html',
  styleUrl: './detail-livre.component.css'
})
export class DetailLivreComponent implements OnInit {
  livre: Livre | null = null;
  livresSimilaires: Livre[] = [];
  loading = true;
  error = '';
  empruntLoading = false;
  
  isAuthenticated = false;
  currentTab: 'details' | 'exemplaires' | 'avis' = 'details';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private livreService: LivreService,
    private empruntService: EmpruntService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated;
    
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadLivre(id);
      }
    });
  }

  loadLivre(id: number) {
    this.loading = true;
    this.error = '';

    this.livreService.getLivre(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.livre = response.data;
          this.loadLivresSimilaires();
        } else {
          this.error = 'Livre non trouvé';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement livre:', error);
        this.error = 'Erreur lors du chargement du livre';
        this.loading = false;
      }
    });
  }

  loadLivresSimilaires() {
    if (!this.livre?.categorie?.id) return;

    this.livreService.getLivres({
      categorie_id: this.livre.categorie.id,
      per_page: 4
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Exclure le livre actuel
          this.livresSimilaires = response.data.data
            .filter(l => l.id !== this.livre?.id)
            .slice(0, 3);
        }
      },
      error: (error) => {
        console.error('Erreur chargement livres similaires:', error);
      }
    });
  }

  emprunter() {
    if (!this.isAuthenticated) {
      alert('Vous devez être connecté pour emprunter un livre');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: this.router.url } 
      });
      return;
    }

    if (!this.livre?.id) return;

    if (!this.livre.est_disponible) {
      alert('Ce livre n\'est pas disponible pour le moment');
      return;
    }

    if (!confirm(`Voulez-vous emprunter "${this.livre.titre}" ?`)) {
      return;
    }

    this.empruntLoading = true;

    // Créer la requête d'emprunt
    // Note: L'API backend attend un exemplaire_id
    // Le backend doit gérer la sélection du premier exemplaire disponible pour ce livre
    // Pour l'instant, on envoie 1 comme valeur temporaire (à ajuster selon votre backend)
    const empruntRequest: EmpruntRequest = {
      exemplaire_id: this.livre.id // Temporaire - idéalement le backend devrait accepter livre_id
    };

    this.empruntService.emprunter(empruntRequest).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Livre emprunté avec succès ! Vous pouvez le récupérer à la bibliothèque.');
          this.loadLivre(this.livre!.id); // Recharger pour mettre à jour la disponibilité
          this.router.navigate(['/mes-emprunts']);
        }
        this.empruntLoading = false;
      },
      error: (error) => {
        console.error('Erreur emprunt:', error);
        alert(error.error?.message || 'Erreur lors de l\'emprunt');
        this.empruntLoading = false;
      }
    });
  }

  reserver() {
    if (!this.isAuthenticated) {
      alert('Vous devez être connecté pour réserver un livre');
      this.router.navigate(['/login']);
      return;
    }

    alert('Fonctionnalité de réservation en cours de développement');
  }

  changeTab(tab: 'details' | 'exemplaires' | 'avis') {
    this.currentTab = tab;
  }

  getDefaultCover(titre: string): string {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    const index = titre.length % colors.length;
    return colors[index];
  }

  goBack() {
    this.router.navigate(['/livres']);
  }

  shareBook() {
    if (navigator.share && this.livre) {
      navigator.share({
        title: this.livre.titre,
        text: `Découvrez "${this.livre.titre}" de ${this.livre.auteur}`,
        url: window.location.href
      }).catch(err => console.log('Erreur partage:', err));
    } else {
      // Fallback : copier le lien
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  }

  get disponibiliteTexte(): string {
    if (!this.livre) return '';
    const dispo = this.livre.exemplaires_disponibles || 0;
    const total = this.livre.nombre_exemplaires || 0;
    return `${dispo} sur ${total} exemplaire${total > 1 ? 's' : ''} disponible${dispo > 1 ? 's' : ''}`;
  }

  get disponibiliteClass(): string {
    if (!this.livre) return 'gray';
    const dispo = this.livre.exemplaires_disponibles || 0;
    const total = this.livre.nombre_exemplaires || 0;
    const ratio = dispo / total;
    
    if (ratio === 0) return 'red';
    if (ratio < 0.3) return 'orange';
    if (ratio < 0.7) return 'yellow';
    return 'green';
  }
}
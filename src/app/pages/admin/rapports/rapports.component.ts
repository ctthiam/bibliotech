// ============================================
// src/app/pages/admin/rapports/rapports.component.ts
// Créez: ng g c pages/admin/rapports --standalone
// ============================================
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rapports.component.html',
  styleUrl: './rapports.component.css'
})
export class RapportsComponent {
  loading = false;
  
  // Filtres
  moisSelectionne = new Date().getMonth() + 1;
  anneeSelectionnee = new Date().getFullYear();
  
  mois = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];
  
  annees: number[] = [];

  constructor(private http: HttpClient) {
    // Générer les 5 dernières années
    const anneeActuelle = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.annees.push(anneeActuelle - i);
    }
  }

  /**
   * Télécharger un rapport
   */
  private telechargerRapport(url: string, params: any = {}) {
    this.loading = true;
    
    // Construire l'URL avec les paramètres
    const queryParams = new URLSearchParams(params).toString();
    const fullUrl = `${environment.apiUrl}${url}${queryParams ? '?' + queryParams : ''}`;
    
    // Télécharger avec le token d'authentification
    const token = localStorage.getItem('token');
    
    fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }
      return response.blob();
    })
    .then(blob => {
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.getFileName(url, params);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      this.loading = false;
    })
    .catch(error => {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement du rapport');
      this.loading = false;
    });
  }

  private getFileName(endpoint: string, params: any): string {
    const date = new Date().toISOString().split('T')[0];
    
    if (endpoint.includes('mon-historique')) return `historique-emprunts-${date}.pdf`;
    if (endpoint.includes('mes-penalites')) return `mes-penalites-${date}.pdf`;
    if (endpoint.includes('mensuel')) return `rapport-mensuel-${params.mois}-${params.annee}.pdf`;
    if (endpoint.includes('retards')) return `rapport-retards-${date}.pdf`;
    if (endpoint.includes('annuel')) return `rapport-annuel-${params.annee}.pdf`;
    if (endpoint.includes('inventaire')) return `inventaire-${date}.xlsx`;
    if (endpoint.includes('csv')) return `emprunts-${date}.csv`;
    
    return `rapport-${date}.pdf`;
  }

  /**
   * RAPPORTS LECTEUR
   */
  telechargerMonHistorique() {
    this.telechargerRapport('/rapports/mon-historique');
  }

  telechargerMesPenalites() {
    this.telechargerRapport('/rapports/mes-penalites');
  }

  /**
   * RAPPORTS ADMIN
   */
  telechargerRapportMensuel() {
    this.telechargerRapport('/rapports/mensuel-emprunts', {
      mois: this.moisSelectionne,
      annee: this.anneeSelectionnee
    });
  }

  telechargerRapportRetards() {
    this.telechargerRapport('/rapports/retards-penalites');
  }

  telechargerRapportAnnuel() {
    this.telechargerRapport('/rapports/annuel', {
      annee: this.anneeSelectionnee
    });
  }

  /**
   * EXPORTS
   */
  exporterInventaire() {
    this.telechargerRapport('/rapports/export/inventaire');
  }

  exporterEmpruntsCSV() {
    this.telechargerRapport('/rapports/export/emprunts-csv');
  }
}
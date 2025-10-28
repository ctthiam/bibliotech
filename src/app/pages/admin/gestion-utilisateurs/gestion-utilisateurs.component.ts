// ============================================
// src/app/pages/admin/gestion-utilisateurs/gestion-utilisateurs.component.ts
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-gestion-utilisateurs',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './gestion-utilisateurs.component.html',
  styleUrl: './gestion-utilisateurs.component.css'
})
export class GestionUtilisateursComponent implements OnInit {
  utilisateurs: User[] = [];
  loading = true;
  error = '';

  // Filtres
  searchTerm = '';
  selectedRole: string = 'tous';

  // Modal
  showModal = false;
  modalMode: 'view' | 'delete' | 'edit-role' = 'view';
  selectedUser: User | null = null;
  newRole: string = '';

  // Stats
  stats = {
    total_utilisateurs: 0,
    lecteurs: 0,
    bibliothecaires: 0,
    administrateurs: 0
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUtilisateurs();
  }

  loadUtilisateurs() {
    this.loading = true;
    this.error = '';

    // TEMPORAIRE : Simulation de données
    // À remplacer par un vrai service UserService avec API
    setTimeout(() => {
      this.utilisateurs = this.generateMockUsers();
      this.calculateStats();
      this.loading = false;
    }, 500);
  }

  // TEMPORAIRE : Génération de données fictives
  generateMockUsers(): User[] {
    const users: User[] = [];
    
    // Lecteurs
    for (let i = 1; i <= 15; i++) {
      users.push({
        id: i,
        nom: `LECTEUR${i}`,
        prenom: `Lecteur`,
        email: `lecteur${i}@bibliotech.com`,
        telephone: `77123456${i}`,
        role: 'lecteur',
        date_creation: '2024-01-15',
        lecteur: {
          id: i,
          numero_carte: `LECT-${1000 + i}`,
          date_naissance: '1995-06-15',
          statut: i % 5 === 0 ? 'suspendu' : 'actif',
          quota_emprunt: 5,
          penalites_impayees: i % 3 === 0 ? 500 : 0
        }
      });
    }

    // Bibliothécaires
    for (let i = 1; i <= 3; i++) {
      users.push({
        id: 15 + i,
        nom: `SALL${i}`,
        prenom: `Bibliothécaire`,
        email: `biblio${i}@bibliotech.com`,
        telephone: `77234567${i}`,
        role: 'bibliothecaire',
        date_creation: '2024-01-10',
        bibliothecaire: {
          id: i,
          service: i === 1 ? 'Prêt' : i === 2 ? 'Catalogage' : 'Accueil',
          autorisations: ['gerer_catalogue', 'gerer_emprunts']
        }
      });
    }

    // Administrateurs
    users.push({
      id: 19,
      nom: 'DIOP',
      prenom: 'Administrateur',
      email: 'admin@bibliotech.com',
      telephone: '771234567',
      role: 'administrateur',
      date_creation: '2024-01-01',
      administrateur: {
        id: 1,
        privileges: ['all']
      }
    });

    return users;
  }

  calculateStats() {
    this.stats.total_utilisateurs = this.utilisateurs.length;
    this.stats.lecteurs = this.utilisateurs.filter(u => u.role === 'lecteur').length;
    this.stats.bibliothecaires = this.utilisateurs.filter(u => u.role === 'bibliothecaire').length;
    this.stats.administrateurs = this.utilisateurs.filter(u => u.role === 'administrateur').length;
  }

  onFilterChange() {
    // Filtrage géré par le getter filteredUsers
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedRole = 'tous';
  }

  voirDetails(user: User) {
    this.selectedUser = user;
    this.modalMode = 'view';
    this.showModal = true;
  }

  changerRole(user: User) {
    this.selectedUser = user;
    this.newRole = user.role;
    this.modalMode = 'edit-role';
    this.showModal = true;
  }

  confirmerSuppression(user: User) {
    this.selectedUser = user;
    this.modalMode = 'delete';
    this.showModal = true;
  }

  validerChangementRole() {
    if (!this.selectedUser) return;

    // TEMPORAIRE : Simulation de l'API
    // À remplacer par : this.userService.updateRole(id, newRole).subscribe(...)
    alert(`Rôle de ${this.selectedUser.prenom} ${this.selectedUser.nom} changé en ${this.newRole}`);
    
    this.selectedUser.role = this.newRole as 'lecteur' | 'bibliothecaire' | 'administrateur';
    this.calculateStats();
    this.closeModal();
  }

  supprimerUtilisateur() {
    if (!this.selectedUser) return;

    // TEMPORAIRE : Simulation de l'API
    alert(`Utilisateur ${this.selectedUser.prenom} ${this.selectedUser.nom} supprimé`);
    
    this.utilisateurs = this.utilisateurs.filter(u => u.id !== this.selectedUser?.id);
    this.calculateStats();
    this.closeModal();
  }

  toggleStatut(user: User) {
    if (!user.lecteur) return;
    
    const newStatut = user.lecteur.statut === 'actif' ? 'suspendu' : 'actif';
    user.lecteur.statut = newStatut;
    alert(`Statut changé en : ${newStatut}`);
  }

  closeModal() {
    this.showModal = false;
    this.selectedUser = null;
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'administrateur': return 'admin';
      case 'bibliothecaire': return 'staff';
      case 'lecteur': return 'lecteur';
      default: return 'gray';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'administrateur': return 'Administrateur';
      case 'bibliothecaire': return 'Bibliothécaire';
      case 'lecteur': return 'Lecteur';
      default: return role;
    }
  }

  getStatutClass(statut?: string): string {
    switch (statut) {
      case 'actif': return 'success';
      case 'suspendu': return 'warning';
      case 'bloque': return 'danger';
      default: return 'gray';
    }
  }

  getUserInitials(user: User): string {
    return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedRole !== 'tous');
  }

  get filteredUsers(): User[] {
    let filtered = [...this.utilisateurs];

    // Filtre par rôle
    if (this.selectedRole !== 'tous') {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }

    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.nom.toLowerCase().includes(term) ||
        u.prenom.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.lecteur?.numero_carte?.toLowerCase().includes(term))
      );
    }

    return filtered;
  }
}
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent) },
  
  // Routes publiques
  { path: 'livres', loadComponent: () => import('./pages/livres/liste-livres/liste-livres.component').then(m => m.ListeLivresComponent) },
  { path: 'livres/:id', loadComponent: () => import('./pages/livres/detail-livre/detail-livre.component').then(m => m.DetailLivreComponent) },
  
  // Routes protégées - Lecteur
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/lecteur/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'mes-emprunts',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/lecteur/mes-emprunts/mes-emprunts.component').then(m => m.MesEmpruntsComponent)
  },
  
  // Routes protégées - Admin
  {
    path: 'admin/dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'admin/livres',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/gestion-livres/gestion-livres.component').then(m => m.GestionLivresComponent)
  },
  {
    path: 'admin/livres/nouveau',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/form-livre/form-livre.component').then(m => m.FormLivreComponent)
  },
  {
    path: 'admin/livres/modifier/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/form-livre/form-livre.component').then(m => m.FormLivreComponent)
  },
  {
    path: 'admin/emprunts',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/gestion-emprunts/gestion-emprunts.component').then(m => m.GestionEmpruntsComponent)
  },
  {
    path: 'admin/utilisateurs',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/gestion-utilisateurs/gestion-utilisateurs.component').then(m => m.GestionUtilisateursComponent)
  },
  {
    path: 'admin/statistiques',  // ✅ CORRIGÉ : Ajout du 'S' pour correspondre au navbar
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/statistiques/statistiques.component').then(m => m.StatistiquesComponent)
  },
  {
    path: 'admin/categories',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/gestion-categories/gestion-categories.component').then(m => m.GestionCategoriesComponent)
  },
  {
    path: 'profil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profil/profil.component').then(m => m.ProfilComponent)
  },
  {
    path: 'mes-penalites',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/lecteur/mes-penalites/mes-penalites.component').then(m => m.MesPenalitesComponent)
  },
  {
    path: 'mes-reservations',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/lecteur/mes-reservations/mes-reservations.component').then(m => m.MesReservationsComponent)
  },
  {
    path: 'admin/rapports',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/rapports/rapports.component').then(m => m.RapportsComponent)
  },
  // Catch-all
  { path: '**', redirectTo: 'home' }
];
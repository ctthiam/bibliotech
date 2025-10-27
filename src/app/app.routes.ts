import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'livres',
    loadComponent: () => import('./pages/livres/liste-livres/liste-livres.component').then(m => m.ListeLivresComponent)
  },
  {
    path: 'livres/:id',
    loadComponent: () => import('./pages/livres/detail-livre/detail-livre.component').then(m => m.DetailLivreComponent)
  },
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
  {
    path: '**',
    redirectTo: 'home'
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
    path: 'admin/dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
  }

];
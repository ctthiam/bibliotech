// ============================================
// src/app/shared/notification-bell/notification-bell.component.ts
// Créez ce composant: ng g c shared/notification-bell --standalone
// ============================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService, Notification } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.css'
})
export class NotificationBellComponent implements OnInit {
  showDropdown = false;
  unreadCount = 0;
  notifications: Notification[] = [];
  loading = false;

  constructor(public notificationService: NotificationService) {}

  ngOnInit() {
    // S'abonner au compteur de notifications non lues
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    
    if (this.showDropdown && this.notifications.length === 0) {
      this.loadNotifications();
    }
  }

  closeDropdown() {
    this.showDropdown = false;
  }

  loadNotifications() {
    this.loading = true;
    this.notificationService.getNotifications({ per_page: 5 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.notifications = response.data.data || [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement notifications:', error);
        this.loading = false;
      }
    });
  }

  markAsRead(notification: Notification, event: Event) {
    event.stopPropagation();
    
    if (!notification.lu) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.lu = true;
          this.loadNotifications();
        }
      });
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.lu = true);
        this.loadNotifications();
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  }

  getTypeIcon(type: string): string {
    return this.notificationService.getTypeIcon(type);
  }

  getTypeColor(type: string): string {
    return this.notificationService.getTypeColor(type);
  }
}
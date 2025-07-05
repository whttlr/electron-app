/**
 * Notification Manager
 * Core notification management system with queuing and persistence
 */

import { NotificationType, ToastOptions, Toast } from './types';

export class NotificationManager {
  private toasts: Toast[] = [];
  private listeners: Set<(toasts: Toast[]) => void> = new Set();
  private queue: ToastOptions[] = [];
  private isProcessing = false;
  private maxToasts = 5;
  private defaultDuration = 4000;
  
  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }
  
  public subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  public show(options: ToastOptions): string {
    const id = options.id || `toast-${Date.now()}-${Math.random()}`;
    
    const toast: Toast = {
      id,
      type: options.type,
      title: options.title,
      message: options.message || '',
      duration: options.duration !== undefined ? options.duration : this.defaultDuration,
      persistent: options.persistent || false,
      actions: options.actions || [],
      icon: options.icon,
      onClick: options.onClick,
      onClose: options.onClose,
      position: options.position || 'top-right',
      sound: options.sound !== false,
      priority: options.priority || 'medium',
      timestamp: new Date(),
      read: false,
    };
    
    // Handle priority
    if (toast.priority === 'critical') {
      this.toasts.unshift(toast);
    } else {
      this.toasts.push(toast);
    }
    
    // Limit number of toasts
    if (this.toasts.length > this.maxToasts) {
      const removed = this.toasts.splice(this.maxToasts);
      removed.forEach(t => t.onClose?.());
    }
    
    this.notify();
    
    // Auto remove after duration
    if (!toast.persistent && toast.duration > 0) {
      setTimeout(() => {
        this.hide(id);
      }, toast.duration);
    }
    
    // Play sound for high priority notifications
    if (toast.sound && (toast.priority === 'high' || toast.priority === 'critical')) {
      this.playNotificationSound(toast.type);
    }
    
    return id;
  }
  
  public hide(id: string) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      const toast = this.toasts[index];
      toast.onClose?.();
      this.toasts.splice(index, 1);
      this.notify();
    }
  }
  
  public clear(type?: NotificationType) {
    if (type) {
      this.toasts = this.toasts.filter(t => t.type !== type);
    } else {
      this.toasts = [];
    }
    this.notify();
  }
  
  public markAsRead(id: string) {
    const toast = this.toasts.find(t => t.id === id);
    if (toast) {
      toast.read = true;
      this.notify();
    }
  }
  
  public getToasts() {
    return [...this.toasts];
  }
  
  public getUnreadCount() {
    return this.toasts.filter(t => !t.read).length;
  }
  
  private playNotificationSound(type: NotificationType) {
    // In a real implementation, you would play different sounds based on type
    try {
      const audio = new Audio();
      switch (type) {
        case 'error':
        case 'safety':
          audio.src = '/sounds/error.mp3';
          break;
        case 'warning':
          audio.src = '/sounds/warning.mp3';
          break;
        case 'success':
          audio.src = '/sounds/success.mp3';
          break;
        default:
          audio.src = '/sounds/notification.mp3';
      }
      audio.play().catch(() => {}); // Ignore errors if sound files don't exist
    } catch (error) {
      // Ignore sound errors
    }
  }
  
  // Convenience methods
  public success(title: string, message?: string, options?: Partial<ToastOptions>) {
    return this.show({ ...options, type: 'success', title, message });
  }
  
  public error(title: string, message?: string, options?: Partial<ToastOptions>) {
    return this.show({ ...options, type: 'error', title, message, priority: 'high' });
  }
  
  public warning(title: string, message?: string, options?: Partial<ToastOptions>) {
    return this.show({ ...options, type: 'warning', title, message });
  }
  
  public info(title: string, message?: string, options?: Partial<ToastOptions>) {
    return this.show({ ...options, type: 'info', title, message });
  }
  
  public machine(title: string, message?: string, options?: Partial<ToastOptions>) {
    return this.show({ ...options, type: 'machine', title, message, priority: 'high' });
  }
  
  public safety(title: string, message?: string, options?: Partial<ToastOptions>) {
    return this.show({ ...options, type: 'safety', title, message, priority: 'critical', persistent: true });
  }
  
  public job(title: string, message?: string, options?: Partial<ToastOptions>) {
    return this.show({ ...options, type: 'job', title, message });
  }
}

export const notificationManager = new NotificationManager();
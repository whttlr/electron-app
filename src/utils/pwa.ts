/**
 * Progressive Web App Utilities
 * 
 * Utilities for PWA functionality including service worker registration,
 * offline support, push notifications, and app installation.
 */

// Service Worker Registration
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered successfully:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available
            showUpdateAvailableNotification();
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Show update notification
const showUpdateAvailableNotification = () => {
  const updateNotification = document.createElement('div');
  updateNotification.id = 'update-notification';
  updateNotification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1f2937;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      z-index: 10000;
      max-width: 300px;
    ">
      <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
        🆕 App Update Available
      </h4>
      <p style="margin: 0 0 12px 0; font-size: 12px; color: #d1d5db;">
        A new version of the CNC Control app is available.
      </p>
      <div style="display: flex; gap: 8px;">
        <button onclick="updateApp()" style="
          background: #3b82f6;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        ">Update</button>
        <button onclick="dismissUpdate()" style="
          background: transparent;
          color: #9ca3af;
          border: 1px solid #4b5563;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        ">Later</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(updateNotification);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    dismissUpdate();
  }, 10000);
};

// Update app function
(window as any).updateApp = () => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
};

// Dismiss update notification
(window as any).dismissUpdate = () => {
  const notification = document.getElementById('update-notification');
  if (notification) {
    notification.remove();
  }
};

// Install prompt handling
export class PWAInstaller {
  private deferredPrompt: any = null;
  private installButton: HTMLElement | null = null;

  constructor() {
    this.setupInstallPrompt();
  }

  private setupInstallPrompt() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // Listen for the app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.hideInstallButton();
      this.deferredPrompt = null;
    });
  }

  private showInstallButton() {
    // Create install button if it doesn't exist
    if (!this.installButton) {
      this.installButton = document.createElement('button');
      this.installButton.id = 'pwa-install-button';
      this.installButton.innerHTML = `
        <div style="
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
          z-index: 10000;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          📱 Install App
        </div>
      `;
      
      this.installButton.addEventListener('click', () => {
        this.installApp();
      });
      
      document.body.appendChild(this.installButton);
    }
  }

  private hideInstallButton() {
    if (this.installButton) {
      this.installButton.remove();
      this.installButton = null;
    }
  }

  async installApp() {
    if (!this.deferredPrompt) {
      console.log('No install prompt available');
      return;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    this.deferredPrompt = null;
    this.hideInstallButton();
  }

  isInstallAvailable(): boolean {
    return !!this.deferredPrompt;
  }

  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }
}

// Offline status management
export class OfflineManager {
  private isOnline = navigator.onLine;
  private listeners: Array<(isOnline: boolean) => void> = [];

  constructor() {
    this.setupEventListeners();
    this.showOfflineIndicator();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      this.hideOfflineIndicator();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
      this.showOfflineIndicator();
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  private showOfflineIndicator() {
    if (this.isOnline) return;

    const offlineIndicator = document.createElement('div');
    offlineIndicator.id = 'offline-indicator';
    offlineIndicator.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #dc2626;
        color: white;
        padding: 8px;
        text-align: center;
        font-size: 14px;
        font-weight: 500;
        z-index: 10001;
      ">
        ⚠️ You are currently offline. Some features may be limited.
      </div>
    `;
    
    document.body.appendChild(offlineIndicator);
    
    // Adjust body padding to account for indicator
    document.body.style.paddingTop = '40px';
  }

  private hideOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.remove();
      document.body.style.paddingTop = '0';
    }
  }

  onStatusChange(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getStatus(): boolean {
    return this.isOnline;
  }
}

// Background sync for data persistence
export class BackgroundSync {
  private syncQueue: Array<{
    id: string;
    action: string;
    data: any;
    timestamp: number;
    retries: number;
  }> = [];

  constructor() {
    this.loadQueueFromStorage();
    this.setupSyncListener();
  }

  private loadQueueFromStorage() {
    try {
      const stored = localStorage.getItem('cnc-sync-queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  private saveQueueToStorage() {
    try {
      localStorage.setItem('cnc-sync-queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  private setupSyncListener() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      // Register for background sync
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('cnc-data-sync');
      });
    }

    // Fallback: try to sync when coming online
    window.addEventListener('online', () => {
      this.processSyncQueue();
    });
  }

  addToQueue(action: string, data: any): string {
    const id = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.syncQueue.push({
      id,
      action,
      data,
      timestamp: Date.now(),
      retries: 0,
    });
    
    this.saveQueueToStorage();
    
    // Try immediate sync if online
    if (navigator.onLine) {
      this.processSyncQueue();
    }
    
    return id;
  }

  private async processSyncQueue() {
    if (this.syncQueue.length === 0) return;

    const itemsToProcess = [...this.syncQueue];
    
    for (const item of itemsToProcess) {
      try {
        await this.processQueueItem(item);
        
        // Remove successful item from queue
        this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
      } catch (error) {
        console.error('Failed to sync item:', error);
        
        // Increment retry count
        item.retries++;
        
        // Remove items that have failed too many times
        if (item.retries >= 3) {
          this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
          console.warn('Removing failed sync item after 3 retries:', item);
        }
      }
    }
    
    this.saveQueueToStorage();
  }

  private async processQueueItem(item: any): Promise<void> {
    // This would typically make API calls to sync data
    switch (item.action) {
      case 'machine-position':
        return this.syncMachinePosition(item.data);
      case 'job-update':
        return this.syncJobUpdate(item.data);
      case 'settings-change':
        return this.syncSettingsChange(item.data);
      default:
        console.warn('Unknown sync action:', item.action);
    }
  }

  private async syncMachinePosition(data: any): Promise<void> {
    // Example sync implementation
    const response = await fetch('/api/machine/position', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
  }

  private async syncJobUpdate(data: any): Promise<void> {
    const response = await fetch(`/api/jobs/${data.jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Job sync failed: ${response.statusText}`);
    }
  }

  private async syncSettingsChange(data: any): Promise<void> {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Settings sync failed: ${response.statusText}`);
    }
  }

  getQueueSize(): number {
    return this.syncQueue.length;
  }

  clearQueue(): void {
    this.syncQueue = [];
    this.saveQueueToStorage();
  }
}

// Push notifications for critical alerts
export class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null;

  constructor(registration: ServiceWorkerRegistration | null) {
    this.registration = registration;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return null;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
        ),
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });
  }

  showLocalNotification(title: string, options: NotificationOptions = {}) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options,
      });
    }
  }

  async showMachineAlert(message: string, severity: 'info' | 'warning' | 'error' | 'critical') {
    const options: NotificationOptions = {
      body: message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'machine-alert',
      requireInteraction: severity === 'critical',
      silent: severity === 'info',
    };

    // Add vibration pattern based on severity
    if ('vibrate' in navigator) {
      const vibrationPatterns = {
        info: [100],
        warning: [100, 50, 100],
        error: [200, 100, 200],
        critical: [300, 100, 300, 100, 300],
      };
      
      options.vibrate = vibrationPatterns[severity];
    }

    this.showLocalNotification('CNC Machine Alert', options);
  }
}

// Main PWA manager that coordinates all PWA features
export class PWAManager {
  private installer: PWAInstaller;
  private offlineManager: OfflineManager;
  private backgroundSync: BackgroundSync;
  private pushManager: PushNotificationManager | null = null;

  constructor() {
    this.installer = new PWAInstaller();
    this.offlineManager = new OfflineManager();
    this.backgroundSync = new BackgroundSync();
    
    this.initialize();
  }

  private async initialize() {
    // Register service worker
    const registration = await registerServiceWorker();
    
    if (registration) {
      this.pushManager = new PushNotificationManager(registration);
    }

    // Setup offline data sync
    this.offlineManager.onStatusChange((isOnline) => {
      if (isOnline && this.backgroundSync.getQueueSize() > 0) {
        console.log('Back online, processing sync queue...');
      }
    });
  }

  // Public API
  isInstallable(): boolean {
    return this.installer.isInstallAvailable();
  }

  isStandalone(): boolean {
    return this.installer.isStandalone();
  }

  async installApp(): Promise<void> {
    return this.installer.installApp();
  }

  isOnline(): boolean {
    return this.offlineManager.getStatus();
  }

  onOfflineStatusChange(listener: (isOnline: boolean) => void): () => void {
    return this.offlineManager.onStatusChange(listener);
  }

  queueForSync(action: string, data: any): string {
    return this.backgroundSync.addToQueue(action, data);
  }

  getSyncQueueSize(): number {
    return this.backgroundSync.getQueueSize();
  }

  async enablePushNotifications(): Promise<boolean> {
    if (!this.pushManager) return false;
    
    const subscription = await this.pushManager.subscribeToPush();
    return !!subscription;
  }

  showMachineAlert(message: string, severity: 'info' | 'warning' | 'error' | 'critical'): void {
    this.pushManager?.showMachineAlert(message, severity);
  }
}

// Export singleton instance
export const pwaManager = new PWAManager();
/**
 * Offline Synchronization System
 *
 * Handles data persistence, conflict resolution, and synchronization
 * when the CNC control application goes offline. Critical for industrial
 * environments where network connectivity may be unreliable.
 */

import { pwaManager } from './pwa';

export interface SyncableData {
  id: string;
  type: 'position' | 'job' | 'settings' | 'alarm' | 'log';
  data: any;
  timestamp: number;
  version: number;
  checksum?: string;
}

export interface ConflictResolution {
  strategy: 'server-wins' | 'client-wins' | 'last-modified-wins' | 'merge' | 'manual';
  resolver?: (serverData: SyncableData, clientData: SyncableData) => SyncableData;
}

export interface SyncOptions {
  batchSize?: number;
  retryAttempts?: number;
  retryDelay?: number;
  conflictResolution?: ConflictResolution;
  priorityTypes?: string[];
}

// Local database wrapper for IndexedDB
class LocalDatabase {
  private db: IDBDatabase | null = null;

  private dbName = 'cnc-offline-db';

  private version = 1;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp');
          syncStore.createIndex('type', 'type');
          syncStore.createIndex('priority', 'priority');
        }

        if (!db.objectStoreNames.contains('offlineData')) {
          const dataStore = db.createObjectStore('offlineData', { keyPath: 'id' });
          dataStore.createIndex('type', 'type');
          dataStore.createIndex('timestamp', 'timestamp');
        }

        if (!db.objectStoreNames.contains('conflicts')) {
          const conflictStore = db.createObjectStore('conflicts', { keyPath: 'id' });
          conflictStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  async add(storeName: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async put(storeName: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get(storeName: string, id: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Main offline sync manager
export class OfflineSyncManager {
  private db: LocalDatabase;

  private syncInProgress = false;

  private syncQueue: SyncableData[] = [];

  private options: Required<SyncOptions>;

  private listeners: Set<(event: SyncEvent) => void> = new Set();

  constructor(options: SyncOptions = {}) {
    this.db = new LocalDatabase();
    this.options = {
      batchSize: options.batchSize || 50,
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 1000,
      conflictResolution: options.conflictResolution || { strategy: 'last-modified-wins' },
      priorityTypes: options.priorityTypes || ['alarm', 'position', 'job', 'settings', 'log'],
    };
  }

  async initialize(): Promise<void> {
    await this.db.initialize();
    await this.loadSyncQueue();
    this.setupEventListeners();
  }

  private async loadSyncQueue(): Promise<void> {
    try {
      this.syncQueue = await this.db.getAll('syncQueue');
      this.sortSyncQueue();
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  private sortSyncQueue(): void {
    this.syncQueue.sort((a, b) => {
      // Sort by priority type first
      const aPriority = this.options.priorityTypes.indexOf(a.type);
      const bPriority = this.options.priorityTypes.indexOf(b.type);

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Then by timestamp
      return a.timestamp - b.timestamp;
    });
  }

  private setupEventListeners(): void {
    // Listen for online/offline events
    pwaManager.onOfflineStatusChange((isOnline) => {
      if (isOnline && this.syncQueue.length > 0) {
        this.startSync();
      }
    });

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && pwaManager.isOnline() && this.syncQueue.length > 0) {
        this.startSync();
      }
    });
  }

  // Add data to sync queue
  async queueForSync(data: Omit<SyncableData, 'id' | 'timestamp' | 'version'>): Promise<string> {
    const syncData: SyncableData = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      version: 1,
      ...data,
    };

    // Add checksum for data integrity
    syncData.checksum = await this.calculateChecksum(syncData.data);

    // Add to queue
    this.syncQueue.push(syncData);
    this.sortSyncQueue();

    // Persist to local storage
    await this.db.put('syncQueue', syncData);

    // Try immediate sync if online
    if (pwaManager.isOnline()) {
      this.startSync();
    }

    this.notifyListeners({ type: 'queued', data: syncData });
    return syncData.id;
  }

  // Store data for offline access
  async storeOfflineData(data: SyncableData): Promise<void> {
    await this.db.put('offlineData', data);
    this.notifyListeners({ type: 'stored', data });
  }

  // Get offline data
  async getOfflineData(type?: string): Promise<SyncableData[]> {
    const allData = await this.db.getAll('offlineData');
    return type ? allData.filter((item) => item.type === type) : allData;
  }

  // Start synchronization process
  async startSync(): Promise<void> {
    if (this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    this.notifyListeners({ type: 'sync-started' });

    try {
      await this.processSyncQueue();
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifyListeners({ type: 'sync-failed', error });
    } finally {
      this.syncInProgress = false;
      this.notifyListeners({ type: 'sync-completed' });
    }
  }

  private async processSyncQueue(): Promise<void> {
    const batches = this.createBatches(this.syncQueue, this.options.batchSize);

    for (const batch of batches) {
      await this.processBatch(batch);
    }
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async processBatch(batch: SyncableData[]): Promise<void> {
    const syncPromises = batch.map((item) => this.syncItem(item));
    await Promise.allSettled(syncPromises);
  }

  private async syncItem(item: SyncableData): Promise<void> {
    let retryCount = 0;

    while (retryCount < this.options.retryAttempts) {
      try {
        await this.performSync(item);

        // Remove from queue on success
        this.syncQueue = this.syncQueue.filter((queueItem) => queueItem.id !== item.id);
        await this.db.delete('syncQueue', item.id);

        this.notifyListeners({ type: 'item-synced', data: item });
        return;
      } catch (error) {
        retryCount++;

        if (retryCount < this.options.retryAttempts) {
          await this.delay(this.options.retryDelay * retryCount);
        } else {
          console.error(`Failed to sync item ${item.id} after ${this.options.retryAttempts} attempts:`, error);
          this.notifyListeners({ type: 'item-failed', data: item, error });
        }
      }
    }
  }

  private async performSync(item: SyncableData): Promise<void> {
    const endpoint = this.getEndpointForType(item.type);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sync-Version': item.version.toString(),
          'X-Sync-Checksum': item.checksum || '',
        },
        body: JSON.stringify(item.data),
      });

      if (!response.ok) {
        if (response.status === 409) {
          // Conflict detected
          await this.handleConflict(item, response);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  private async handleConflict(localItem: SyncableData, response: Response): Promise<void> {
    const serverData = await response.json();
    const serverItem: SyncableData = {
      id: localItem.id,
      type: localItem.type,
      data: serverData,
      timestamp: new Date(response.headers.get('X-Server-Timestamp') || Date.now()).getTime(),
      version: parseInt(response.headers.get('X-Server-Version') || '1'),
      checksum: response.headers.get('X-Server-Checksum') || undefined,
    };

    const resolution = await this.resolveConflict(localItem, serverItem);

    // Store conflict information
    await this.db.put('conflicts', {
      id: `conflict-${Date.now()}`,
      localData: localItem,
      serverData: serverItem,
      resolution,
      timestamp: Date.now(),
    });

    // Apply resolution
    if (resolution.strategy !== 'manual') {
      const resolvedData = await this.applyResolution(localItem, serverItem, resolution);
      await this.performSync(resolvedData);
    }
  }

  private async resolveConflict(localItem: SyncableData, serverItem: SyncableData): Promise<ConflictResolution> {
    const { strategy } = this.options.conflictResolution;

    switch (strategy) {
      case 'server-wins':
        return { strategy: 'server-wins' };
      case 'client-wins':
        return { strategy: 'client-wins' };
      case 'last-modified-wins':
        return {
          strategy: localItem.timestamp > serverItem.timestamp ? 'client-wins' : 'server-wins',
        };
      case 'merge':
        return {
          strategy: 'merge',
          resolver: this.options.conflictResolution.resolver,
        };
      case 'manual':
        return { strategy: 'manual' };
      default:
        return { strategy: 'last-modified-wins' };
    }
  }

  private async applyResolution(
    localItem: SyncableData,
    serverItem: SyncableData,
    resolution: ConflictResolution,
  ): Promise<SyncableData> {
    switch (resolution.strategy) {
      case 'server-wins':
        return serverItem;
      case 'client-wins':
        return localItem;
      case 'merge':
        if (resolution.resolver) {
          return resolution.resolver(serverItem, localItem);
        }
        return localItem;
      default:
        return localItem;
    }
  }

  private getEndpointForType(type: string): string {
    const endpoints = {
      position: '/api/machine/position',
      job: '/api/jobs',
      settings: '/api/settings',
      alarm: '/api/alarms',
      log: '/api/logs',
    };

    return endpoints[type as keyof typeof endpoints] || '/api/sync';
  }

  private async calculateChecksum(data: any): Promise<string> {
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data);
    const dataBuffer = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private notifyListeners(event: SyncEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Sync event listener error:', error);
      }
    });
  }

  // Public API methods
  addEventListener(listener: (event: SyncEvent) => void): void {
    this.listeners.add(listener);
  }

  removeEventListener(listener: (event: SyncEvent) => void): void {
    this.listeners.delete(listener);
  }

  getSyncQueueSize(): number {
    return this.syncQueue.length;
  }

  async clearSyncQueue(): Promise<void> {
    this.syncQueue = [];
    await this.db.clear('syncQueue');
  }

  async getConflicts(): Promise<any[]> {
    return await this.db.getAll('conflicts');
  }

  async clearConflicts(): Promise<void> {
    await this.db.clear('conflicts');
  }

  getStatus(): {
    isOnline: boolean;
    syncInProgress: boolean;
    queueSize: number;
    lastSyncTime: number | null;
    } {
    return {
      isOnline: pwaManager.isOnline(),
      syncInProgress: this.syncInProgress,
      queueSize: this.syncQueue.length,
      lastSyncTime: null, // TODO: Implement last sync time tracking
    };
  }
}

// Sync event types
export type SyncEvent =
  | { type: 'queued'; data: SyncableData }
  | { type: 'stored'; data: SyncableData }
  | { type: 'sync-started' }
  | { type: 'sync-completed' }
  | { type: 'sync-failed'; error: any }
  | { type: 'item-synced'; data: SyncableData }
  | { type: 'item-failed'; data: SyncableData; error: any };

// Export singleton instance
export const offlineSyncManager = new OfflineSyncManager();

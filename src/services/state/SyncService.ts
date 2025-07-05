/**
 * Real-Time Data Synchronization
 * 
 * WebSocket-based real-time data sync with reconnection,
 * conflict resolution, and offline queue management.
 */

import { storeEventBus } from './storeUtils';
import type {
  RealTimeData,
  DataSubscription,
  MachineState,
  JobRecord,
  PerformanceMetrics,
} from './types';

// ============================================================================
// TYPES
// ============================================================================

interface SyncMessage {
  type: 'subscribe' | 'unsubscribe' | 'data' | 'ping' | 'pong' | 'error';
  id?: string;
  subscription?: Partial<DataSubscription>;
  data?: any;
  timestamp?: number;
  error?: string;
}

interface QueuedMessage {
  message: SyncMessage;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

interface SyncConfig {
  wsUrl: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  queueMaxSize: number;
  enableOfflineQueue: boolean;
}

// ============================================================================
// REAL-TIME SYNC MANAGER
// ============================================================================

export class RealTimeSyncManager {
  private ws: WebSocket | null = null;
  private config: SyncConfig;
  private subscriptions: Map<string, DataSubscription> = new Map();
  private messageQueue: QueuedMessage[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private heartbeatTimer?: NodeJS.Timeout;
  private reconnectTimer?: NodeJS.Timeout;
  private lastPingTime = 0;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private conflictResolvers: Map<string, (local: any, remote: any) => any> = new Map();
  
  constructor(config: Partial<SyncConfig> = {}) {
    this.config = {
      wsUrl: config.wsUrl || 'ws://localhost:8080/ws',
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
      queueMaxSize: config.queueMaxSize || 100,
      enableOfflineQueue: config.enableOfflineQueue !== false,
    };
    
    this.setupDefaultConflictResolvers();
  }
  
  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }
    
    console.log('🔌 Connecting to real-time sync server...');
    
    try {
      this.ws = new WebSocket(this.config.wsUrl);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }
  
  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log('🔌 Disconnecting from real-time sync server...');
    
    this.isConnected = false;
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.subscriptions.clear();
    this.messageQueue = [];
  }
  
  /**
   * Subscribe to real-time data updates
   */
  subscribe(subscription: Omit<DataSubscription, 'id' | 'lastUpdate' | 'active'>): string {
    const id = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const fullSubscription: DataSubscription = {
      ...subscription,
      id,
      lastUpdate: new Date(),
      active: true,
    };
    
    this.subscriptions.set(id, fullSubscription);
    
    // Send subscription to server if connected
    if (this.isConnected) {
      this.sendMessage({
        type: 'subscribe',
        id,
        subscription: fullSubscription,
      });
    }
    
    return id;
  }
  
  /**
   * Unsubscribe from real-time data updates
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;
    
    subscription.active = false;
    
    if (this.isConnected) {
      this.sendMessage({
        type: 'unsubscribe',
        id: subscriptionId,
      });
    }
    
    this.subscriptions.delete(subscriptionId);
  }
  
  /**
   * Send data to server
   */
  sendData(type: string, data: any): void {
    this.sendMessage({
      type: 'data',
      data: {
        type,
        payload: data,
        timestamp: Date.now(),
      },
    });
  }
  
  /**
   * Listen for specific data types
   */
  on(dataType: string, listener: (data: any) => void): () => void {
    if (!this.listeners.has(dataType)) {
      this.listeners.set(dataType, new Set());
    }
    
    this.listeners.get(dataType)!.add(listener);
    
    return () => {
      this.listeners.get(dataType)?.delete(listener);
    };
  }
  
  /**
   * Get connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    subscriptions: number;
    queueSize: number;
    lastPing: number;
  } {
    return {
      connected: this.isConnected,
      subscriptions: this.subscriptions.size,
      queueSize: this.messageQueue.length,
      lastPing: this.lastPingTime,
    };
  }
  
  /**
   * Set conflict resolver for specific data type
   */
  setConflictResolver(dataType: string, resolver: (local: any, remote: any) => any): void {
    this.conflictResolvers.set(dataType, resolver);
  }
  
  // Private methods
  
  private handleOpen(): void {
    console.log('✅ Connected to real-time sync server');
    
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Re-subscribe to all active subscriptions
    this.subscriptions.forEach((subscription) => {
      if (subscription.active) {
        this.sendMessage({
          type: 'subscribe',
          id: subscription.id,
          subscription,
        });
      }
    });
    
    // Process queued messages
    this.processMessageQueue();
    
    storeEventBus.emit('sync:connected');
  }
  
  private handleMessage(event: MessageEvent): void {
    try {
      const message: SyncMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'data':
          this.handleDataMessage(message);
          break;
          
        case 'pong':
          this.lastPingTime = Date.now();
          break;
          
        case 'error':
          console.error('Sync server error:', message.error);
          storeEventBus.emit('sync:error', message.error);
          break;
          
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse sync message:', error);
    }
  }
  
  private handleClose(event: CloseEvent): void {
    console.log('🔌 Disconnected from real-time sync server');
    
    this.isConnected = false;
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    storeEventBus.emit('sync:disconnected', event);
    
    // Attempt reconnection if not manually closed
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }
  
  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    storeEventBus.emit('sync:error', error);
  }
  
  private handleDataMessage(message: SyncMessage): void {
    if (!message.data) return;
    
    const { type, payload, timestamp } = message.data;
    
    // Check for conflicts
    const resolver = this.conflictResolvers.get(type);
    let finalData = payload;
    
    if (resolver) {
      // Get current local data (this would need to be implemented per data type)
      const localData = this.getLocalData(type);
      if (localData && timestamp && localData.lastUpdate > timestamp) {
        // Local data is newer, resolve conflict
        finalData = resolver(localData, payload);
      }
    }
    
    // Notify listeners
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(finalData);
        } catch (error) {
          console.error(`Error in sync listener for ${type}:`, error);
        }
      });
    }
    
    // Emit general sync event
    storeEventBus.emit('sync:data', { type, data: finalData });
  }
  
  private sendMessage(message: SyncMessage): void {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send sync message:', error);
        this.queueMessage(message);
      }
    } else {
      this.queueMessage(message);
    }
  }
  
  private queueMessage(message: SyncMessage): void {
    if (!this.config.enableOfflineQueue) return;
    
    const queuedMessage: QueuedMessage = {
      message,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3,
    };
    
    this.messageQueue.push(queuedMessage);
    
    // Limit queue size
    if (this.messageQueue.length > this.config.queueMaxSize) {
      this.messageQueue.shift(); // Remove oldest message
    }
  }
  
  private processMessageQueue(): void {
    const messagesToSend = [...this.messageQueue];
    this.messageQueue = [];
    
    messagesToSend.forEach(queuedMessage => {
      if (queuedMessage.retries < queuedMessage.maxRetries) {
        queuedMessage.retries++;
        this.sendMessage(queuedMessage.message);
      }
    });
  }
  
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.sendMessage({ type: 'ping', timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }
  
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      storeEventBus.emit('sync:max-reconnects-reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  private setupDefaultConflictResolvers(): void {
    // Machine state resolver - prefer most recent timestamp
    this.setConflictResolver('machine', (local: MachineState, remote: MachineState) => {
      return local.lastUpdate > remote.lastUpdate ? local : remote;
    });
    
    // Job resolver - prefer local changes for current job
    this.setConflictResolver('job', (local: JobRecord, remote: JobRecord) => {
      // If job is currently running locally, prefer local state
      if (local.status === 'running') {
        return local;
      }
      return remote;
    });
    
    // Performance metrics resolver - merge data
    this.setConflictResolver('performance', (local: PerformanceMetrics, remote: PerformanceMetrics) => {
      // Merge performance data, keeping most recent values
      return {
        ...remote,
        cpu: {
          ...remote.cpu,
          history: [...(local.cpu.history || []), ...(remote.cpu.history || [])].slice(-100),
        },
        memory: {
          ...remote.memory,
          history: [...(local.memory.history || []), ...(remote.memory.history || [])].slice(-100),
        },
      };
    });
  }
  
  private getLocalData(type: string): any {
    // This would need to be implemented to get current local data
    // For now, return null to avoid conflicts
    return null;
  }
}

// ============================================================================
// STORE INTEGRATION
// ============================================================================

/**
 * Integration with Zustand stores for real-time sync
 */
export class StoreSync {
  private syncManager: RealTimeSyncManager;
  private subscriptions: string[] = [];
  
  constructor(syncManager: RealTimeSyncManager) {
    this.syncManager = syncManager;
    this.setupStoreIntegration();
  }
  
  private setupStoreIntegration(): void {
    // Listen for sync data and update stores
    this.syncManager.on('machine', (data) => {
      storeEventBus.emit('store:machine:sync', data);
    });
    
    this.syncManager.on('job', (data) => {
      storeEventBus.emit('store:job:sync', data);
    });
    
    this.syncManager.on('performance', (data) => {
      storeEventBus.emit('store:performance:sync', data);
    });
    
    // Subscribe to store changes and send to server
    storeEventBus.subscribe('machine:position-update', (data) => {
      this.syncManager.sendData('machine', {
        type: 'position',
        position: data,
        timestamp: Date.now(),
      });
    });
    
    storeEventBus.subscribe('job:progress-update', (data) => {
      this.syncManager.sendData('job', {
        type: 'progress',
        ...data,
        timestamp: Date.now(),
      });
    });
    
    storeEventBus.subscribe('performance:metrics-update', (data) => {
      this.syncManager.sendData('performance', {
        type: 'metrics',
        ...data,
        timestamp: Date.now(),
      });
    });
  }
  
  /**
   * Start syncing specific data types
   */
  startSync(dataTypes: string[] = ['machine', 'job', 'performance']): void {
    dataTypes.forEach(type => {
      const subscriptionId = this.syncManager.subscribe({
        type: type as any,
        interval: 1000, // 1 second updates
      });
      
      this.subscriptions.push(subscriptionId);
    });
  }
  
  /**
   * Stop all sync subscriptions
   */
  stopSync(): void {
    this.subscriptions.forEach(id => {
      this.syncManager.unsubscribe(id);
    });
    this.subscriptions = [];
  }
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

// Create singleton sync manager
export const syncManager = new RealTimeSyncManager({
  wsUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws',
});

// Create store sync integration
export const storeSync = new StoreSync(syncManager);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Initialize real-time sync
 */
export async function initializeSync(): Promise<void> {
  try {
    await syncManager.connect();
    storeSync.startSync();
    console.log('✅ Real-time sync initialized');
  } catch (error) {
    console.error('❌ Failed to initialize real-time sync:', error);
  }
}

/**
 * Shutdown real-time sync
 */
export function shutdownSync(): void {
  storeSync.stopSync();
  syncManager.disconnect();
  console.log('🔌 Real-time sync shutdown');
}

/**
 * Get sync statistics
 */
export function getSyncStatistics() {
  return syncManager.getConnectionStatus();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  // Initialize sync after a delay to allow stores to be ready
  setTimeout(() => {
    initializeSync().catch(console.error);
  }, 3000);
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    shutdownSync();
  });
}

export default {
  RealTimeSyncManager,
  StoreSync,
  syncManager,
  storeSync,
  initializeSync,
  shutdownSync,
  getSyncStatistics,
};

/**
 * Connection Management Service
 * Handles CNC machine connection state, preferences, and database persistence
 */

import apiClient from '../api/api-client';
import { configManagementService } from '../bundled-api-supabase/config-management';

export interface SerialPort {
  path: string
  manufacturer?: string
  serialNumber?: string
  pnpId?: string
  locationId?: string
  productId?: string
  vendorId?: string
}

export interface ConnectionStatus {
  connected: boolean
  port?: string
  baudRate?: number
  lastConnected?: string
  error?: string
}

export interface ConnectionPreferences {
  defaultPort?: string
  autoConnect: boolean
  defaultBaudRate: number
  connectionTimeout: number
  retryAttempts: number
  lastUsedPorts: string[]
}

export class ConnectionService {
  private static instance: ConnectionService;

  private connectionStatus: ConnectionStatus = { connected: false };

  private availablePorts: SerialPort[] = [];

  private preferences: ConnectionPreferences = {
    autoConnect: false,
    defaultBaudRate: 115200,
    connectionTimeout: 5000,
    retryAttempts: 3,
    lastUsedPorts: [],
  };

  private statusListeners: ((status: ConnectionStatus) => void)[] = [];

  static getInstance(): ConnectionService {
    if (!ConnectionService.instance) {
      ConnectionService.instance = new ConnectionService();
    }
    return ConnectionService.instance;
  }

  /**
   * Initialize the connection service
   */
  async initialize(): Promise<void> {
    try {
      // Load preferences from database
      await this.loadPreferences();

      // Get initial connection status
      await this.refreshConnectionStatus();

      // List available ports
      await this.refreshAvailablePorts();

      // Auto-connect if enabled
      if (this.preferences.autoConnect && this.preferences.defaultPort) {
        await this.autoConnect();
      }

      console.log('✅ Connection service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize connection service:', error);
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Get available serial ports
   */
  getAvailablePorts(): SerialPort[] {
    return [...this.availablePorts];
  }

  /**
   * Get connection preferences
   */
  getPreferences(): ConnectionPreferences {
    return { ...this.preferences };
  }

  /**
   * Refresh connection status from API
   */
  async refreshConnectionStatus(): Promise<ConnectionStatus> {
    try {
      const status = await apiClient.getConnectionStatus();
      this.connectionStatus = {
        connected: status.connected || false,
        port: status.port,
        baudRate: status.baudRate,
        lastConnected: status.lastConnected,
        error: status.error,
      };
      this.notifyStatusListeners();
      return this.getConnectionStatus();
    } catch (error) {
      console.error('Failed to refresh connection status:', error);
      this.connectionStatus = {
        connected: false,
        error: error instanceof Error ? error.message : 'Connection check failed',
      };
      this.notifyStatusListeners();
      return this.getConnectionStatus();
    }
  }

  /**
   * Refresh available ports from API
   */
  async refreshAvailablePorts(): Promise<SerialPort[]> {
    try {
      const response = await apiClient.listSerialPorts();
      this.availablePorts = response.ports || [];
      return this.getAvailablePorts();
    } catch (error) {
      console.error('Failed to refresh available ports:', error);
      this.availablePorts = [];
      return [];
    }
  }

  /**
   * Connect to a specific port
   */
  async connect(port: string, baudRate?: number): Promise<boolean> {
    try {
      const response = await apiClient.connect(port);

      if (response.success) {
        this.connectionStatus = {
          connected: true,
          port,
          baudRate: baudRate || this.preferences.defaultBaudRate,
          lastConnected: new Date().toISOString(),
        };

        // Update last used ports
        this.updateLastUsedPorts(port);

        // Save preferences
        await this.savePreferences();

        this.notifyStatusListeners();
        console.log(`✅ Connected to ${port}`);
        return true;
      }
      throw new Error(response.error || 'Connection failed');
    } catch (error) {
      console.error(`❌ Failed to connect to ${port}:`, error);
      this.connectionStatus = {
        connected: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
      this.notifyStatusListeners();
      return false;
    }
  }

  /**
   * Disconnect from current port
   */
  async disconnect(): Promise<boolean> {
    try {
      const response = await apiClient.disconnect();

      if (response.success) {
        this.connectionStatus = {
          connected: false,
          lastConnected: this.connectionStatus.lastConnected,
        };
        this.notifyStatusListeners();
        console.log('✅ Disconnected successfully');
        return true;
      }
      throw new Error(response.error || 'Disconnect failed');
    } catch (error) {
      console.error('❌ Failed to disconnect:', error);
      // Force disconnect status even if API call failed
      this.connectionStatus = {
        connected: false,
        error: error instanceof Error ? error.message : 'Disconnect failed',
      };
      this.notifyStatusListeners();
      return false;
    }
  }

  /**
   * Auto-connect using default port
   */
  async autoConnect(): Promise<boolean> {
    if (!this.preferences.defaultPort) {
      console.log('No default port set for auto-connect');
      return false;
    }

    console.log(`🔄 Auto-connecting to ${this.preferences.defaultPort}`);
    return this.connect(this.preferences.defaultPort);
  }

  /**
   * Update connection preferences
   */
  async updatePreferences(updates: Partial<ConnectionPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...updates };
    await this.savePreferences();
  }

  /**
   * Set default port
   */
  async setDefaultPort(port: string): Promise<void> {
    await this.updatePreferences({ defaultPort: port });
  }

  /**
   * Toggle auto-connect
   */
  async setAutoConnect(enabled: boolean): Promise<void> {
    await this.updatePreferences({ autoConnect: enabled });
  }

  /**
   * Add connection status listener
   */
  addStatusListener(callback: (status: ConnectionStatus) => void): void {
    this.statusListeners.push(callback);
  }

  /**
   * Remove connection status listener
   */
  removeStatusListener(callback: (status: ConnectionStatus) => void): void {
    this.statusListeners = this.statusListeners.filter((listener) => listener !== callback);
  }

  /**
   * Load preferences from database
   */
  private async loadPreferences(): Promise<void> {
    try {
      const savedPreferences = await configManagementService.getPreference('connection_preferences');
      if (savedPreferences) {
        this.preferences = { ...this.preferences, ...savedPreferences };
      }
    } catch (error) {
      console.error('Failed to load connection preferences:', error);
    }
  }

  /**
   * Save preferences to database
   */
  private async savePreferences(): Promise<void> {
    try {
      await configManagementService.setPreference('connection_preferences', this.preferences);
    } catch (error) {
      console.error('Failed to save connection preferences:', error);
    }
  }

  /**
   * Update last used ports list
   */
  private updateLastUsedPorts(port: string): void {
    const lastUsedPorts = this.preferences.lastUsedPorts.filter((p) => p !== port);
    lastUsedPorts.unshift(port); // Add to beginning
    this.preferences.lastUsedPorts = lastUsedPorts.slice(0, 5); // Keep only last 5
  }

  /**
   * Notify all status listeners
   */
  private notifyStatusListeners(): void {
    this.statusListeners.forEach((callback) => {
      try {
        callback(this.getConnectionStatus());
      } catch (error) {
        console.error('Error in connection status listener:', error);
      }
    });
  }

  /**
   * Check if a specific port is available
   */
  isPortAvailable(port: string): boolean {
    return this.availablePorts.some((p) => p.path === port);
  }

  /**
   * Get port info by path
   */
  getPortInfo(port: string): SerialPort | undefined {
    return this.availablePorts.find((p) => p.path === port);
  }

  /**
   * Validate connection settings
   */
  validateConnectionSettings(port: string, baudRate: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!port) {
      errors.push('Port is required');
    } else if (!this.isPortAvailable(port)) {
      errors.push(`Port ${port} is not available`);
    }

    if (!baudRate || baudRate <= 0) {
      errors.push('Valid baud rate is required');
    }

    return { valid: errors.length === 0, errors };
  }
}

// Export singleton instance
export const connectionService = ConnectionService.getInstance();

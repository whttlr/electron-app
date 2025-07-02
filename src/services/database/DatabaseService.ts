// Database Service
// Handles all database operations for state persistence using localStorage

import {
  PluginRecord,
  PluginStateRecord,
  CommandRecord,
  AppStateRecord,
  SettingHistoryRecord,
  PluginDependencyRecord
} from './types';

export class DatabaseService {
  private static instance: DatabaseService | null = null;
  private initialized = false;

  private constructor() {
    // Browser-compatible constructor
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database connection (localStorage-based)
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize localStorage storage if needed
      if (!localStorage.getItem('cnc_plugins')) {
        localStorage.setItem('cnc_plugins', JSON.stringify([]));
      }
      if (!localStorage.getItem('cnc_plugin_states')) {
        localStorage.setItem('cnc_plugin_states', JSON.stringify([]));
      }
      if (!localStorage.getItem('cnc_command_history')) {
        localStorage.setItem('cnc_command_history', JSON.stringify([]));
      }
      
      // Initialize or migrate app state
      const existingAppState = localStorage.getItem('cnc_app_state');
      if (!existingAppState) {
        localStorage.setItem('cnc_app_state', JSON.stringify({
          id: 'singleton',
          machineConnected: false,
          machineUnits: 'metric',
          theme: 'light',
          language: 'en',
          showGrid: true,
          showCoordinates: true,
          autoConnect: false,
          sessionStartedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
      } else {
        // Migrate existing state to include missing UI fields
        const currentState = JSON.parse(existingAppState);
        let needsUpdate = false;
        
        if (currentState.showGrid === undefined) {
          currentState.showGrid = true;
          needsUpdate = true;
        }
        if (currentState.showCoordinates === undefined) {
          currentState.showCoordinates = true;
          needsUpdate = true;
        }
        if (currentState.autoConnect === undefined) {
          currentState.autoConnect = false;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          currentState.updatedAt = new Date().toISOString();
          localStorage.setItem('cnc_app_state', JSON.stringify(currentState));
          console.log('Migrated app state to include UI settings');
        }
      }
      
      if (!localStorage.getItem('cnc_setting_history')) {
        localStorage.setItem('cnc_setting_history', JSON.stringify([]));
      }
      
      this.initialized = true;
      console.log('Database service initialized (localStorage)');
    } catch (error) {
      console.error('Failed to initialize database service:', error);
      throw error;
    }
  }

  /**
   * Cleanup database connection
   */
  public async cleanup(): Promise<void> {
    this.initialized = false;
  }

  // ================== Plugin Management ==================

  /**
   * Get all plugins with their states
   */
  public async getPlugins(): Promise<PluginRecord[]> {
    const pluginsData = localStorage.getItem('cnc_plugins');
    const statesData = localStorage.getItem('cnc_plugin_states');
    
    const plugins = pluginsData ? JSON.parse(pluginsData) : [];
    const states = statesData ? JSON.parse(statesData) : [];
    
    // Merge plugins with their states
    return plugins.map((plugin: any) => {
      const state = states.find((s: any) => s.pluginId === plugin.pluginId);
      return {
        ...plugin,
        state: state || undefined
      };
    });
  }

  /**
   * Get plugin by ID
   */
  public async getPlugin(pluginId: string): Promise<PluginRecord | null> {
    const pluginsData = localStorage.getItem('cnc_plugins');
    const statesData = localStorage.getItem('cnc_plugin_states');
    
    const plugins = pluginsData ? JSON.parse(pluginsData) : [];
    const states = statesData ? JSON.parse(statesData) : [];
    
    const plugin = plugins.find((p: any) => p.pluginId === pluginId);
    if (!plugin) return null;
    
    const state = states.find((s: any) => s.pluginId === pluginId);
    return {
      ...plugin,
      state: state || undefined
    };
  }

  /**
   * Create or update plugin
   */
  public async upsertPlugin(plugin: Omit<PluginRecord, 'id' | 'installedAt' | 'updatedAt'>): Promise<PluginRecord> {
    const pluginsData = localStorage.getItem('cnc_plugins');
    const plugins = pluginsData ? JSON.parse(pluginsData) : [];
    
    const existingIndex = plugins.findIndex((p: any) => p.pluginId === plugin.pluginId);
    const now = new Date().toISOString();
    
    const pluginRecord = {
      id: existingIndex >= 0 ? plugins[existingIndex].id : Date.now().toString(),
      ...plugin,
      installedAt: existingIndex >= 0 ? plugins[existingIndex].installedAt : now,
      updatedAt: now
    };
    
    if (existingIndex >= 0) {
      plugins[existingIndex] = pluginRecord;
    } else {
      plugins.push(pluginRecord);
    }
    
    localStorage.setItem('cnc_plugins', JSON.stringify(plugins));
    return pluginRecord;
  }

  /**
   * Delete plugin
   */
  public async deletePlugin(pluginId: string): Promise<void> {
    const pluginsData = localStorage.getItem('cnc_plugins');
    const plugins = pluginsData ? JSON.parse(pluginsData) : [];
    
    const filteredPlugins = plugins.filter((p: any) => p.pluginId !== pluginId);
    localStorage.setItem('cnc_plugins', JSON.stringify(filteredPlugins));
    
    // Also remove plugin state
    const statesData = localStorage.getItem('cnc_plugin_states');
    const states = statesData ? JSON.parse(statesData) : [];
    const filteredStates = states.filter((s: any) => s.pluginId !== pluginId);
    localStorage.setItem('cnc_plugin_states', JSON.stringify(filteredStates));
  }

  /**
   * Get or create plugin state
   */
  public async getPluginState(pluginId: string): Promise<PluginStateRecord | null> {
    const statesData = localStorage.getItem('cnc_plugin_states');
    const states = statesData ? JSON.parse(statesData) : [];
    
    const state = states.find((s: any) => s.pluginId === pluginId);
    return state || null;
  }

  /**
   * Update plugin state
   */
  public async updatePluginState(
    pluginId: string, 
    updates: Partial<Omit<PluginStateRecord, 'id' | 'pluginId' | 'createdAt' | 'updatedAt'>>
  ): Promise<PluginStateRecord> {
    const statesData = localStorage.getItem('cnc_plugin_states');
    const states = statesData ? JSON.parse(statesData) : [];
    
    const existingIndex = states.findIndex((s: any) => s.pluginId === pluginId);
    const now = new Date().toISOString();
    
    const stateRecord = {
      id: existingIndex >= 0 ? states[existingIndex].id : Date.now().toString(),
      pluginId,
      enabled: true,
      priority: 100,
      autoStart: false,
      createdAt: existingIndex >= 0 ? states[existingIndex].createdAt : now,
      updatedAt: now,
      ...updates
    };
    
    if (existingIndex >= 0) {
      states[existingIndex] = stateRecord;
    } else {
      states.push(stateRecord);
    }
    
    localStorage.setItem('cnc_plugin_states', JSON.stringify(states));
    return stateRecord;
  }

  // ================== Command History ==================

  /**
   * Add command to history
   */
  public async addCommandHistory(command: Omit<CommandRecord, 'id' | 'executedAt'>): Promise<CommandRecord> {
    const historyData = localStorage.getItem('cnc_command_history');
    const history = historyData ? JSON.parse(historyData) : [];
    
    const commandRecord = {
      id: Date.now().toString(),
      ...command,
      executedAt: new Date().toISOString()
    };
    
    history.push(commandRecord);
    
    // Keep only last 1000 commands to prevent localStorage from growing too large
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
    
    localStorage.setItem('cnc_command_history', JSON.stringify(history));
    return commandRecord;
  }

  /**
   * Get command history with pagination
   */
  public async getCommandHistory(
    limit = 100,
    offset = 0,
    filters?: {
      type?: string;
      source?: string;
      pluginId?: string;
      status?: string;
      from?: Date;
      to?: Date;
    }
  ): Promise<CommandRecord[]> {
    const historyData = localStorage.getItem('cnc_command_history');
    let history = historyData ? JSON.parse(historyData) : [];
    
    // Apply filters
    if (filters) {
      history = history.filter((cmd: any) => {
        if (filters.type && cmd.type !== filters.type) return false;
        if (filters.source && cmd.source !== filters.source) return false;
        if (filters.pluginId && cmd.pluginId !== filters.pluginId) return false;
        if (filters.status && cmd.status !== filters.status) return false;
        if (filters.from && new Date(cmd.executedAt) < filters.from) return false;
        if (filters.to && new Date(cmd.executedAt) > filters.to) return false;
        return true;
      });
    }
    
    // Sort by executedAt desc
    history.sort((a: any, b: any) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime());
    
    // Apply pagination
    return history.slice(offset, offset + limit);
  }

  /**
   * Clear command history older than specified date
   */
  public async clearCommandHistory(olderThan?: Date): Promise<number> {
    const historyData = localStorage.getItem('cnc_command_history');
    const history = historyData ? JSON.parse(historyData) : [];
    
    const initialCount = history.length;
    
    let filteredHistory;
    if (olderThan) {
      filteredHistory = history.filter((cmd: any) => new Date(cmd.executedAt) >= olderThan);
    } else {
      filteredHistory = [];
    }
    
    localStorage.setItem('cnc_command_history', JSON.stringify(filteredHistory));
    return initialCount - filteredHistory.length;
  }

  // ================== Application State ==================

  /**
   * Get application state
   */
  public async getAppState(): Promise<AppStateRecord | null> {
    const stateData = localStorage.getItem('cnc_app_state');
    return stateData ? JSON.parse(stateData) : null;
  }

  /**
   * Update application state
   */
  public async updateAppState(updates: Partial<Omit<AppStateRecord, 'id' | 'sessionStartedAt' | 'updatedAt'>>): Promise<AppStateRecord> {
    const stateData = localStorage.getItem('cnc_app_state');
    const currentState = stateData ? JSON.parse(stateData) : {
      id: 'singleton',
      machineConnected: false,
      machineUnits: 'metric',
      theme: 'light',
      language: 'en',
      showGrid: true,
      showCoordinates: true,
      autoConnect: false,
      sessionStartedAt: new Date().toISOString()
    };
    
    const updatedState = {
      ...currentState,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('cnc_app_state', JSON.stringify(updatedState));
    return updatedState;
  }

  // ================== Settings History ==================

  /**
   * Track setting change
   */
  public async trackSettingChange(
    key: string,
    oldValue: any,
    newValue: any,
    changedBy: 'user' | 'system' | 'plugin',
    pluginId?: string
  ): Promise<SettingHistoryRecord> {
    const historyData = localStorage.getItem('cnc_setting_history');
    const history = historyData ? JSON.parse(historyData) : [];
    
    const record = {
      id: Date.now().toString(),
      key,
      oldValue,
      newValue,
      changedBy,
      pluginId,
      changedAt: new Date().toISOString()
    };
    
    history.push(record);
    
    // Keep only last 500 settings changes
    if (history.length > 500) {
      history.splice(0, history.length - 500);
    }
    
    localStorage.setItem('cnc_setting_history', JSON.stringify(history));
    return record;
  }

  /**
   * Get setting history with optional filtering
   */
  public async getSettingHistory(filters?: {
    key?: string;
    limit?: number;
    offset?: number;
    changedBy?: 'user' | 'system' | 'plugin';
    from?: Date;
    to?: Date;
  }): Promise<SettingHistoryRecord[]> {
    const historyData = localStorage.getItem('cnc_setting_history');
    let history = historyData ? JSON.parse(historyData) : [];
    
    // Apply filters
    if (filters) {
      history = history.filter((record: any) => {
        if (filters.key && record.key !== filters.key) return false;
        if (filters.changedBy && record.changedBy !== filters.changedBy) return false;
        if (filters.from && new Date(record.changedAt) < filters.from) return false;
        if (filters.to && new Date(record.changedAt) > filters.to) return false;
        return true;
      });
    }
    
    // Sort by changedAt desc
    history.sort((a: any, b: any) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
    
    // Apply pagination
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    return history.slice(offset, offset + limit);
  }

}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
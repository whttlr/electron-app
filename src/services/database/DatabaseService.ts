// Database Service
// Handles all database operations for state persistence

import { PrismaClient } from '@prisma/client';
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
  private prisma: PrismaClient;
  private initialized = false;

  private constructor() {
    this.prisma = new PrismaClient();
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
   * Initialize database connection
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.prisma.$connect();
      this.initialized = true;
      console.log('Database service initialized');
    } catch (error) {
      console.error('Failed to initialize database service:', error);
      throw error;
    }
  }

  /**
   * Cleanup database connection
   */
  public async cleanup(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.initialized = false;
    }
  }

  // ================== Plugin Management ==================

  /**
   * Get all plugins with their states
   */
  public async getPlugins(): Promise<PluginRecord[]> {
    const plugins = await this.prisma.plugin.findMany({
      include: {
        state: true,
        dependencies: {
          include: {
            dependency: true
          }
        }
      }
    });

    return plugins.map(this.transformPluginRecord);
  }

  /**
   * Get plugin by ID
   */
  public async getPlugin(pluginId: string): Promise<PluginRecord | null> {
    const plugin = await this.prisma.plugin.findUnique({
      where: { pluginId },
      include: {
        state: true,
        dependencies: {
          include: {
            dependency: true
          }
        }
      }
    });

    return plugin ? this.transformPluginRecord(plugin) : null;
  }

  /**
   * Create or update plugin
   */
  public async upsertPlugin(plugin: Omit<PluginRecord, 'id' | 'installedAt' | 'updatedAt'>): Promise<PluginRecord> {
    const result = await this.prisma.plugin.upsert({
      where: { pluginId: plugin.pluginId },
      update: {
        name: plugin.name,
        version: plugin.version,
        description: plugin.description,
        type: plugin.type,
        source: plugin.source,
        status: plugin.status,
        updateAvailable: plugin.updateAvailable,
        latestVersion: plugin.latestVersion,
        registryId: plugin.registryId,
        publisherId: plugin.publisherId,
        checksum: plugin.checksum,
        lastCheckedAt: plugin.lastCheckedAt
      },
      create: {
        pluginId: plugin.pluginId,
        name: plugin.name,
        version: plugin.version,
        description: plugin.description,
        type: plugin.type,
        source: plugin.source,
        status: plugin.status,
        updateAvailable: plugin.updateAvailable,
        latestVersion: plugin.latestVersion,
        registryId: plugin.registryId,
        publisherId: plugin.publisherId,
        checksum: plugin.checksum,
        lastCheckedAt: plugin.lastCheckedAt
      },
      include: {
        state: true,
        dependencies: {
          include: {
            dependency: true
          }
        }
      }
    });

    return this.transformPluginRecord(result);
  }

  /**
   * Delete plugin
   */
  public async deletePlugin(pluginId: string): Promise<void> {
    await this.prisma.plugin.delete({
      where: { pluginId }
    });
  }

  /**
   * Get or create plugin state
   */
  public async getPluginState(pluginId: string): Promise<PluginStateRecord | null> {
    const state = await this.prisma.pluginState.findUnique({
      where: { pluginId }
    });

    return state ? this.transformPluginStateRecord(state) : null;
  }

  /**
   * Update plugin state
   */
  public async updatePluginState(
    pluginId: string, 
    updates: Partial<Omit<PluginStateRecord, 'id' | 'pluginId' | 'createdAt' | 'updatedAt'>>
  ): Promise<PluginStateRecord> {
    // Prepare permissions as JSON string if provided
    const data: any = { ...updates };
    if (updates.permissions) {
      data.permissions = JSON.stringify(updates.permissions);
    }
    if (updates.customSettings) {
      data.customSettings = JSON.stringify(updates.customSettings);
    }

    const state = await this.prisma.pluginState.upsert({
      where: { pluginId },
      update: data,
      create: {
        pluginId,
        enabled: true,
        priority: 100,
        autoStart: false,
        ...data
      }
    });

    return this.transformPluginStateRecord(state);
  }

  // ================== Command History ==================

  /**
   * Add command to history
   */
  public async addCommandHistory(command: Omit<CommandRecord, 'id' | 'executedAt'>): Promise<CommandRecord> {
    const result = await this.prisma.commandHistory.create({
      data: {
        command: command.command,
        type: command.type,
        source: command.source,
        pluginId: command.pluginId,
        duration: command.duration,
        status: command.status,
        error: command.error,
        positionBefore: command.positionBefore ? JSON.stringify(command.positionBefore) : null,
        positionAfter: command.positionAfter ? JSON.stringify(command.positionAfter) : null,
        feedRate: command.feedRate,
        spindleSpeed: command.spindleSpeed,
        response: command.response
      }
    });

    return this.transformCommandRecord(result);
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
    const where: any = {};

    if (filters) {
      if (filters.type) where.type = filters.type;
      if (filters.source) where.source = filters.source;
      if (filters.pluginId) where.pluginId = filters.pluginId;
      if (filters.status) where.status = filters.status;
      if (filters.from || filters.to) {
        where.executedAt = {};
        if (filters.from) where.executedAt.gte = filters.from;
        if (filters.to) where.executedAt.lte = filters.to;
      }
    }

    const commands = await this.prisma.commandHistory.findMany({
      where,
      orderBy: { executedAt: 'desc' },
      take: limit,
      skip: offset
    });

    return commands.map(this.transformCommandRecord);
  }

  /**
   * Clear command history older than specified date
   */
  public async clearCommandHistory(olderThan?: Date): Promise<number> {
    const where = olderThan ? { executedAt: { lt: olderThan } } : {};
    
    const result = await this.prisma.commandHistory.deleteMany({
      where
    });

    return result.count;
  }

  // ================== Application State ==================

  /**
   * Get application state
   */
  public async getAppState(): Promise<AppStateRecord | null> {
    const state = await this.prisma.appState.findUnique({
      where: { id: 'singleton' }
    });

    return state ? this.transformAppStateRecord(state) : null;
  }

  /**
   * Update application state
   */
  public async updateAppState(updates: Partial<Omit<AppStateRecord, 'id' | 'sessionStartedAt' | 'updatedAt'>>): Promise<AppStateRecord> {
    // Prepare position data as JSON strings if provided
    const data: any = { ...updates };
    if (updates.currentPosition) {
      data.currentPosition = JSON.stringify(updates.currentPosition);
    }
    if (updates.workOffset) {
      data.workOffset = JSON.stringify(updates.workOffset);
    }

    const state = await this.prisma.appState.upsert({
      where: { id: 'singleton' },
      update: data,
      create: {
        id: 'singleton',
        machineConnected: false,
        machineUnits: 'metric',
        theme: 'light',
        language: 'en',
        ...data
      }
    });

    return this.transformAppStateRecord(state);
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
    const result = await this.prisma.settingHistory.create({
      data: {
        key,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: JSON.stringify(newValue),
        changedBy,
        pluginId
      }
    });

    return {
      id: result.id,
      key: result.key,
      oldValue: result.oldValue ? JSON.parse(result.oldValue) : null,
      newValue: JSON.parse(result.newValue),
      changedBy: result.changedBy as 'user' | 'system' | 'plugin',
      pluginId: result.pluginId || undefined,
      changedAt: result.changedAt
    };
  }

  // ================== Private Helper Methods ==================

  private transformPluginRecord(plugin: any): PluginRecord {
    return {
      id: plugin.id,
      pluginId: plugin.pluginId,
      name: plugin.name,
      version: plugin.version,
      description: plugin.description || undefined,
      type: plugin.type as 'utility' | 'visualization' | 'control' | 'productivity',
      source: plugin.source as 'local' | 'marketplace' | 'registry',
      status: plugin.status as 'active' | 'inactive',
      installedAt: plugin.installedAt,
      updatedAt: plugin.updatedAt,
      lastCheckedAt: plugin.lastCheckedAt || undefined,
      updateAvailable: plugin.updateAvailable,
      latestVersion: plugin.latestVersion || undefined,
      registryId: plugin.registryId || undefined,
      publisherId: plugin.publisherId || undefined,
      checksum: plugin.checksum || undefined,
      state: plugin.state ? this.transformPluginStateRecord(plugin.state) : undefined
    };
  }

  private transformPluginStateRecord(state: any): PluginStateRecord {
    return {
      id: state.id,
      pluginId: state.pluginId,
      enabled: state.enabled,
      placement: state.placement || undefined,
      screen: state.screen || undefined,
      width: state.width || undefined,
      height: state.height || undefined,
      priority: state.priority,
      autoStart: state.autoStart,
      permissions: state.permissions ? JSON.parse(state.permissions) : undefined,
      menuTitle: state.menuTitle || undefined,
      menuIcon: state.menuIcon || undefined,
      routePath: state.routePath || undefined,
      customSettings: state.customSettings ? JSON.parse(state.customSettings) : undefined,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt
    };
  }

  private transformCommandRecord(command: any): CommandRecord {
    return {
      id: command.id,
      command: command.command,
      type: command.type as 'gcode' | 'jog' | 'macro' | 'system',
      source: command.source as 'user' | 'plugin' | 'system' | 'macro',
      pluginId: command.pluginId || undefined,
      executedAt: command.executedAt,
      duration: command.duration || undefined,
      status: command.status as 'success' | 'error' | 'cancelled',
      error: command.error || undefined,
      positionBefore: command.positionBefore ? JSON.parse(command.positionBefore) : undefined,
      positionAfter: command.positionAfter ? JSON.parse(command.positionAfter) : undefined,
      feedRate: command.feedRate || undefined,
      spindleSpeed: command.spindleSpeed || undefined,
      response: command.response || undefined
    };
  }

  private transformAppStateRecord(state: any): AppStateRecord {
    return {
      id: state.id,
      machineConnected: state.machineConnected,
      machineUnits: state.machineUnits as 'metric' | 'imperial',
      currentPosition: state.currentPosition ? JSON.parse(state.currentPosition) : undefined,
      workOffset: state.workOffset ? JSON.parse(state.workOffset) : undefined,
      theme: state.theme,
      language: state.language,
      lastConnectedAt: state.lastConnectedAt || undefined,
      sessionStartedAt: state.sessionStartedAt,
      updatedAt: state.updatedAt
    };
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
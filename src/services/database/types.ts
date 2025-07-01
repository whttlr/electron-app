// Database Service Types

export interface PluginRecord {
  id: string;
  pluginId: string;
  name: string;
  version: string;
  description?: string;
  type: 'utility' | 'visualization' | 'control' | 'productivity';
  source: 'local' | 'marketplace' | 'registry';
  status: 'active' | 'inactive';
  installedAt: Date;
  updatedAt: Date;
  lastCheckedAt?: Date;
  updateAvailable: boolean;
  latestVersion?: string;
  registryId?: string;
  publisherId?: string;
  checksum?: string;
  state?: PluginStateRecord;
}

export interface PluginStateRecord {
  id: string;
  pluginId: string;
  enabled: boolean;
  placement?: 'dashboard' | 'standalone' | 'modal' | 'sidebar';
  screen?: 'main' | 'new' | 'controls' | 'settings';
  width?: string;
  height?: string;
  priority: number;
  autoStart: boolean;
  permissions?: string[];
  menuTitle?: string;
  menuIcon?: string;
  routePath?: string;
  customSettings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommandRecord {
  id: string;
  command: string;
  type: 'gcode' | 'jog' | 'macro' | 'system';
  source: 'user' | 'plugin' | 'system' | 'macro';
  pluginId?: string;
  executedAt: Date;
  duration?: number;
  status: 'success' | 'error' | 'cancelled';
  error?: string;
  positionBefore?: { x: number; y: number; z: number };
  positionAfter?: { x: number; y: number; z: number };
  feedRate?: number;
  spindleSpeed?: number;
  response?: string;
}

export interface AppStateRecord {
  id: string;
  machineConnected: boolean;
  machineUnits: 'metric' | 'imperial';
  currentPosition?: { x: number; y: number; z: number };
  workOffset?: { x: number; y: number; z: number };
  theme: string;
  language: string;
  lastConnectedAt?: Date;
  sessionStartedAt: Date;
  updatedAt: Date;
}

export interface SettingHistoryRecord {
  id: string;
  key: string;
  oldValue?: any;
  newValue: any;
  changedBy: 'user' | 'system' | 'plugin';
  pluginId?: string;
  changedAt: Date;
}

export interface PluginDependencyRecord {
  id: string;
  pluginId: string;
  dependencyId: string;
  versionRange: string;
}
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
  installedAt: Date | string; // Can be string when loaded from localStorage
  updatedAt: Date | string; // Can be string when loaded from localStorage
  lastCheckedAt?: Date | string; // Can be string when loaded from localStorage
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
  createdAt: Date | string; // Can be string when loaded from localStorage
  updatedAt: Date | string; // Can be string when loaded from localStorage
}

export interface CommandRecord {
  id: string;
  command: string;
  type: 'gcode' | 'jog' | 'macro' | 'system';
  source: 'user' | 'plugin' | 'system' | 'macro';
  pluginId?: string;
  executedAt: Date | string; // Can be string when loaded from localStorage
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
  lastConnectedAt?: Date | string; // Can be string when loaded from localStorage
  sessionStartedAt: Date | string; // Can be string when loaded from localStorage
  updatedAt: Date | string; // Can be string when loaded from localStorage
  // Additional settings fields
  showGrid?: boolean;
  showCoordinates?: boolean;
  autoConnect?: boolean;
  // JSON strings for complex settings
  machineSettings?: string;
  jogSettings?: string;
  connectionSettings?: string;
}

export interface SettingHistoryRecord {
  id: string;
  key: string;
  oldValue?: any;
  newValue: any;
  changedBy: 'user' | 'system' | 'plugin';
  pluginId?: string;
  changedAt: Date | string; // Can be string when loaded from localStorage
}

export interface PluginDependencyRecord {
  id: string;
  pluginId: string;
  dependencyId: string;
  versionRange: string;
}

/**
 * State Management Types
 * 
 * Type definitions for all state stores in the CNC application.
 */

// ============================================================================
// MACHINE TYPES
// ============================================================================

export type MachineStatus = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'idle'
  | 'running'
  | 'paused'
  | 'error'
  | 'emergency'
  | 'homing';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface MachineState {
  id: string;
  name: string;
  status: MachineStatus;
  position: Position3D;
  workOrigin: Position3D;
  feedRate: number;
  spindleSpeed: number;
  temperature: number;
  lastUpdate: Date;
  errors: string[];
  warnings: string[];
}

export interface MachineConnection {
  type: 'serial' | 'tcp' | 'usb';
  port?: string;
  ipAddress?: string;
  tcpPort?: number;
  baudRate?: number;
  isConnected: boolean;
  lastPing?: Date;
  latency?: number;
}

export interface WorkingArea {
  width: number;
  height: number;
  depth: number;
  units: 'mm' | 'in';
}

// ============================================================================
// JOB TYPES
// ============================================================================

export type JobStatus = 
  | 'pending'
  | 'queued'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface JobRecord {
  id: string;
  name: string;
  description?: string;
  status: JobStatus;
  progress: number;
  gcodeFile: string;
  startTime?: Date;
  endTime?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  material: {
    type: string;
    thickness: number;
    dimensions: { width: number; height: number };
  };
  toolSettings: {
    toolNumber: number;
    spindleSpeed: number;
    feedRate: number;
    plungeRate: number;
  };
  workOrigin: Position3D;
  totalLines: number;
  currentLine: number;
  errors: string[];
  warnings: string[];
  metadata: Record<string, any>;
}

export interface JobQueue {
  jobs: JobRecord[];
  currentJobId?: string;
  isProcessing: boolean;
  autoStart: boolean;
}

// ============================================================================
// UI TYPES
// ============================================================================

export interface UIState {
  theme: 'light' | 'dark' | 'auto';
  sidebarCollapsed: boolean;
  activeView: string;
  modalStack: string[];
  notificationSettings: NotificationState;
  viewport: {
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
  };
  tour: {
    isActive: boolean;
    currentStep: number;
    completed: string[];
  };
}

export interface NotificationState {
  enabled: boolean;
  sound: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  duration: number;
  maxCount: number;
  types: {
    machine: boolean;
    job: boolean;
    safety: boolean;
    system: boolean;
  };
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

export interface AppSettings {
  general: {
    language: string;
    timezone: string;
    autoSave: boolean;
    autoBackup: boolean;
    checkUpdates: boolean;
  };
  machine: MachineSettings;
  ui: {
    theme: 'light' | 'dark' | 'auto';
    animations: boolean;
    compactMode: boolean;
    showTooltips: boolean;
    defaultView: string;
  };
  performance: {
    maxHistoryEntries: number;
    chartUpdateInterval: number;
    enableOptimizations: boolean;
    lowPowerMode: boolean;
  };
  security: {
    requireConfirmation: boolean;
    emergencyStopDelay: number;
    sessionTimeout: number;
  };
}

export interface MachineSettings {
  workingArea: WorkingArea;
  connection: Omit<MachineConnection, 'isConnected' | 'lastPing' | 'latency'>;
  movement: {
    maxFeedRate: number;
    defaultFeedRate: number;
    rapidSpeed: number;
    jogSpeed: number;
    jogStepSize: number;
    homingRequired: boolean;
  };
  safety: {
    softLimits: boolean;
    hardLimits: boolean;
    emergencyStopEnabled: boolean;
    maxSpindleSpeed?: number;
    temperatureLimit: number;
  };
  calibration: {
    stepsPerMm: Position3D;
    backlash: Position3D;
    homeOffset: Position3D;
    probeOffset: Position3D;
  };
}

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

export interface PerformanceMetrics {
  cpu: {
    usage: number;
    history: number[];
  };
  memory: {
    used: number;
    total: number;
    history: number[];
  };
  network: {
    latency: number;
    bandwidth: number;
    packetsLost: number;
  };
  rendering: {
    fps: number;
    frameTime: number;
    droppedFrames: number;
  };
  machine: {
    commandQueue: number;
    responseTime: number;
    errorRate: number;
  };
}

export interface PerformanceAlert {
  id: string;
  type: 'cpu' | 'memory' | 'network' | 'rendering' | 'machine';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

// ============================================================================
// STORE ACTION TYPES
// ============================================================================

export interface StoreActions<T> {
  reset: () => void;
  subscribe: (listener: (state: T) => void) => () => void;
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
}

// ============================================================================
// REAL-TIME DATA TYPES
// ============================================================================

export interface RealTimeData {
  timestamp: Date;
  machineState: Partial<MachineState>;
  jobProgress?: {
    jobId: string;
    progress: number;
    currentLine: number;
    currentOperation: string;
  };
  performanceMetrics?: Partial<PerformanceMetrics>;
}

export interface DataSubscription {
  id: string;
  type: 'machine' | 'job' | 'performance' | 'all';
  interval: number;
  lastUpdate: Date;
  active: boolean;
}

// ============================================================================
// PERSISTENCE TYPES
// ============================================================================

export interface PersistenceConfig {
  key: string;
  version: number;
  storage: 'localStorage' | 'sessionStorage' | 'indexedDB';
  serialize?: (state: any) => string;
  deserialize?: (str: string) => any;
  partialize?: (state: any) => any;
  merge?: (persistedState: any, currentState: any) => any;
  skipHydration?: boolean;
}

export interface MigrationConfig {
  [version: number]: (state: any) => any;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ErrorState {
  id: string;
  type: 'machine' | 'network' | 'validation' | 'system' | 'user';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
  timestamp: Date;
  resolved: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
  retryCount: number;
  lastError?: Date;
}

// ============================================================================
// CACHE TYPES
// ============================================================================

export interface CacheEntry<T = any> {
  data: T;
  timestamp: Date;
  expiry: Date;
  accessCount: number;
  lastAccess: Date;
  size: number;
}

export interface CacheConfig {
  maxSize: number; // in MB
  maxAge: number; // in milliseconds
  maxEntries: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo';
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  entryCount: number;
  hitRate: number;
}

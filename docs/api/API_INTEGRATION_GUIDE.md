# API Integration Guide

## Overview

The CNC Jog Controls application integrates with multiple APIs to provide comprehensive machine control, data management, and plugin functionality. This guide covers API architecture, integration patterns, authentication, and usage examples.

## Table of Contents

1. [API Architecture](#api-architecture)
2. [Authentication & Security](#authentication--security)
3. [Core API Endpoints](#core-api-endpoints)
4. [CNC-Core Integration](#cnc-core-integration)
5. [Database API](#database-api)
6. [Plugin API](#plugin-api)
7. [Real-time Communication](#real-time-communication)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)
10. [API Client Setup](#api-client-setup)
11. [Testing APIs](#testing-apis)
12. [Troubleshooting](#troubleshooting)

---

## API Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron App                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   UI Library    │  │   Components    │  │     Views       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   API Client    │  │   State Mgmt    │  │   Plugin Mgmt   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Auth Service  │  │   Rate Limiting │  │   Monitoring    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   CNC Core API  │  │  Database API   │  │   Plugin API    │
│                 │  │                 │  │                 │
│  • Machine Ctrl │  │  • User Data    │  │  • Plugin Store │
│  • Positioning  │  │  • Settings     │  │  • Signatures   │
│  • Workspace    │  │  • Job History  │  │  • Validation   │
│  • Safety       │  │  • Logs         │  │  • Sandboxing   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### API Service Structure

```typescript
// src/services/api/index.ts
export interface ApiService {
  // Core CNC functionality
  machine: MachineApi;
  positioning: PositioningApi;
  workspace: WorkspaceApi;
  
  // Data management
  database: DatabaseApi;
  settings: SettingsApi;
  
  // Plugin system
  plugins: PluginApi;
  
  // Authentication
  auth: AuthApi;
}

// API client configuration
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  authToken?: string;
  apiKey?: string;
}
```

### Environment Configuration

```typescript
// src/services/api/config.ts
export const apiConfig = {
  development: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 10000,
    retryAttempts: 3
  },
  staging: {
    baseUrl: 'https://staging-api.cnc-controls.com',
    timeout: 15000,
    retryAttempts: 2
  },
  production: {
    baseUrl: 'https://api.cnc-controls.com',
    timeout: 30000,
    retryAttempts: 1
  }
} as const;
```

---

## Authentication & Security

### Authentication Flow

```typescript
// src/services/api/auth.ts
export interface AuthApi {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<AuthResponse>;
  validateToken(): Promise<boolean>;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

// JWT token management
export class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  setTokens(authResponse: AuthResponse): void {
    this.accessToken = authResponse.accessToken;
    this.refreshToken = authResponse.refreshToken;
    this.expiresAt = Date.now() + (authResponse.expiresIn * 1000);
    
    // Store in secure storage
    this.persistTokens();
  }

  async getValidToken(): Promise<string | null> {
    if (!this.accessToken || !this.expiresAt) {
      return null;
    }

    // Check if token is expired
    if (Date.now() >= this.expiresAt - 60000) { // Refresh 1 minute before expiry
      await this.refreshTokens();
    }

    return this.accessToken;
  }

  private async refreshTokens(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const authResponse: AuthResponse = await response.json();
      this.setTokens(authResponse);
    } catch (error) {
      // Clear tokens on refresh failure
      this.clearTokens();
      throw error;
    }
  }

  private persistTokens(): void {
    // Use electron-store or secure storage
    const store = require('electron-store');
    const secureStore = new store({ encryptionKey: 'cnc-controls-key' });
    
    secureStore.set('auth.accessToken', this.accessToken);
    secureStore.set('auth.refreshToken', this.refreshToken);
    secureStore.set('auth.expiresAt', this.expiresAt);
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
    
    // Clear from storage
    const store = require('electron-store');
    const secureStore = new store({ encryptionKey: 'cnc-controls-key' });
    secureStore.delete('auth.accessToken');
    secureStore.delete('auth.refreshToken');
    secureStore.delete('auth.expiresAt');
  }
}
```

### API Key Management

```typescript
// src/services/api/api-keys.ts
export interface ApiKeyConfig {
  cncCore: string;
  database: string;
  plugins: string;
  monitoring: string;
}

export class ApiKeyManager {
  private static keys: ApiKeyConfig;

  static async loadKeys(): Promise<void> {
    // Load from secure configuration
    const keys = await this.loadSecureConfig();
    
    // Validate key format and permissions
    await this.validateKeys(keys);
    
    this.keys = keys;
  }

  static getKey(service: keyof ApiKeyConfig): string {
    if (!this.keys) {
      throw new Error('API keys not loaded');
    }
    return this.keys[service];
  }

  private static async loadSecureConfig(): Promise<ApiKeyConfig> {
    // Load from environment variables or secure storage
    return {
      cncCore: process.env.CNC_CORE_API_KEY || '',
      database: process.env.DATABASE_API_KEY || '',
      plugins: process.env.PLUGINS_API_KEY || '',
      monitoring: process.env.MONITORING_API_KEY || ''
    };
  }

  private static async validateKeys(keys: ApiKeyConfig): Promise<void> {
    for (const [service, key] of Object.entries(keys)) {
      if (!key) {
        throw new Error(`Missing API key for service: ${service}`);
      }
      
      // Validate key format (example: check length, pattern)
      if (key.length < 32) {
        throw new Error(`Invalid API key format for service: ${service}`);
      }
    }
  }
}
```

---

## Core API Endpoints

### Machine Control API

```typescript
// src/services/api/machine.ts
export interface MachineApi {
  // Connection management
  connect(config: MachineConfig): Promise<ConnectionResult>;
  disconnect(): Promise<void>;
  getStatus(): Promise<MachineStatus>;
  
  // Movement control
  jog(axis: Axis, distance: number, speed?: number): Promise<void>;
  home(axes?: Axis[]): Promise<void>;
  stop(): Promise<void>;
  emergencyStop(): Promise<void>;
  
  // Position tracking
  getPosition(): Promise<Position>;
  setPosition(position: Partial<Position>): Promise<void>;
  
  // Safety features
  getSafetyStatus(): Promise<SafetyStatus>;
  setSafetyLimits(limits: SafetyLimits): Promise<void>;
}

export interface MachineConfig {
  connectionType: 'serial' | 'tcp' | 'usb';
  port: string;
  baudRate?: number;
  protocol: 'grbl' | 'marlin' | 'custom';
  safetyEnabled: boolean;
}

export interface Position {
  x: number;
  y: number;
  z: number;
  units: 'mm' | 'inches';
  timestamp: Date;
}

export interface MachineStatus {
  connected: boolean;
  state: 'idle' | 'running' | 'alarmed' | 'emergency';
  position: Position;
  feedRate: number;
  spindleSpeed: number;
  coolantOn: boolean;
  lastUpdate: Date;
}

// Implementation example
export class MachineApiClient implements MachineApi {
  constructor(private apiClient: ApiClient) {}

  async connect(config: MachineConfig): Promise<ConnectionResult> {
    return this.apiClient.post('/machine/connect', {
      body: config,
      timeout: 30000 // Connection might take time
    });
  }

  async jog(axis: Axis, distance: number, speed?: number): Promise<void> {
    return this.apiClient.post('/machine/jog', {
      body: {
        axis,
        distance,
        speed: speed || 100
      }
    });
  }

  async getPosition(): Promise<Position> {
    return this.apiClient.get('/machine/position');
  }

  async emergencyStop(): Promise<void> {
    return this.apiClient.post('/machine/emergency-stop', {
      priority: 'high', // High priority for safety
      timeout: 5000
    });
  }
}
```

### Workspace API

```typescript
// src/services/api/workspace.ts
export interface WorkspaceApi {
  // Workspace configuration
  getWorkspace(): Promise<WorkspaceConfig>;
  setWorkspace(config: WorkspaceConfig): Promise<void>;
  
  // Working area management
  getWorkingArea(): Promise<WorkingArea>;
  setWorkingArea(area: WorkingArea): Promise<void>;
  
  // Coordinate systems
  getCoordinateSystems(): Promise<CoordinateSystem[]>;
  setCoordinateSystem(system: CoordinateSystem): Promise<void>;
  
  // Visualization data
  getVisualizationData(): Promise<VisualizationData>;
}

export interface WorkspaceConfig {
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  units: 'mm' | 'inches';
  origin: Position;
  safetyZone: SafetyZone;
}

export interface WorkingArea {
  id: string;
  name: string;
  bounds: {
    min: Position;
    max: Position;
  };
  active: boolean;
  created: Date;
  updated: Date;
}

export interface CoordinateSystem {
  id: string;
  name: string;
  origin: Position;
  rotation: number;
  active: boolean;
}
```

---

## CNC-Core Integration

### CNC-Core API Wrapper

```typescript
// src/services/cnc-core/index.ts
import { CNCCore } from 'cnc-core';

export class CNCCoreApiWrapper {
  private cncCore: CNCCore;
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
    this.cncCore = new CNCCore({
      apiEndpoint: apiClient.baseUrl,
      apiKey: ApiKeyManager.getKey('cncCore')
    });
  }

  // Machine control methods
  async initializeMachine(config: MachineConfig): Promise<void> {
    try {
      await this.cncCore.initialize(config);
      
      // Sync with API backend
      await this.apiClient.post('/cnc-core/sync', {
        body: {
          machineId: config.id,
          status: 'initialized',
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to initialize CNC-Core:', error);
      throw new Error('Machine initialization failed');
    }
  }

  async sendGCode(code: string): Promise<GCodeResult> {
    const result = await this.cncCore.sendGCode(code);
    
    // Log to API for history tracking
    await this.apiClient.post('/cnc-core/gcode-log', {
      body: {
        code,
        result,
        timestamp: new Date()
      }
    });

    return result;
  }

  async jogMachine(axis: Axis, distance: number, speed: number): Promise<void> {
    // Validate movement with safety checks
    const safetyCheck = await this.validateMovement(axis, distance);
    if (!safetyCheck.safe) {
      throw new Error(`Unsafe movement: ${safetyCheck.reason}`);
    }

    // Execute movement through CNC-Core
    await this.cncCore.jog(axis, distance, speed);
    
    // Update position tracking
    await this.updatePositionTracking();
  }

  private async validateMovement(axis: Axis, distance: number): Promise<SafetyCheck> {
    const currentPosition = await this.cncCore.getPosition();
    const targetPosition = { ...currentPosition };
    targetPosition[axis] += distance;

    // Check against workspace boundaries
    const workspace = await this.apiClient.get('/workspace');
    return this.checkWorkspaceBounds(targetPosition, workspace);
  }

  private async updatePositionTracking(): Promise<void> {
    const position = await this.cncCore.getPosition();
    
    // Update real-time position in API
    await this.apiClient.post('/machine/position', {
      body: {
        ...position,
        timestamp: new Date()
      }
    });
  }
}
```

### CNC-Core Event Handling

```typescript
// src/services/cnc-core/events.ts
export class CNCCoreEventHandler {
  private cncCore: CNCCore;
  private eventEmitter: EventEmitter;

  constructor(cncCore: CNCCore) {
    this.cncCore = cncCore;
    this.eventEmitter = new EventEmitter();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Machine state changes
    this.cncCore.on('stateChange', (state: MachineState) => {
      this.eventEmitter.emit('machineStateChange', state);
      this.logStateChange(state);
    });

    // Position updates
    this.cncCore.on('positionUpdate', (position: Position) => {
      this.eventEmitter.emit('positionUpdate', position);
      this.broadcastPosition(position);
    });

    // Error events
    this.cncCore.on('error', (error: CNCError) => {
      this.eventEmitter.emit('error', error);
      this.handleError(error);
    });

    // Safety events
    this.cncCore.on('safetyTrigger', (event: SafetyEvent) => {
      this.eventEmitter.emit('safetyTrigger', event);
      this.handleSafetyEvent(event);
    });
  }

  private async logStateChange(state: MachineState): Promise<void> {
    await this.apiClient.post('/cnc-core/state-log', {
      body: {
        state,
        timestamp: new Date()
      }
    });
  }

  private async broadcastPosition(position: Position): Promise<void> {
    // Broadcast to all connected clients
    await this.apiClient.post('/realtime/position', {
      body: position
    });
  }

  private async handleError(error: CNCError): Promise<void> {
    // Log error for debugging
    console.error('CNC-Core Error:', error);
    
    // Report to error tracking service
    await this.apiClient.post('/errors/report', {
      body: {
        source: 'cnc-core',
        error: error.message,
        stack: error.stack,
        timestamp: new Date()
      }
    });

    // Trigger safety shutdown if critical
    if (error.severity === 'critical') {
      await this.cncCore.emergencyStop();
    }
  }

  private async handleSafetyEvent(event: SafetyEvent): Promise<void> {
    // Immediate safety response
    if (event.type === 'emergency') {
      await this.cncCore.emergencyStop();
    }

    // Log safety event
    await this.apiClient.post('/safety/event', {
      body: {
        type: event.type,
        message: event.message,
        timestamp: new Date()
      }
    });

    // Notify operators
    this.eventEmitter.emit('safetyAlert', event);
  }
}
```

---

## Database API

### Database Service Integration

```typescript
// src/services/database/index.ts
export interface DatabaseApi {
  // User data management
  users: UserDataApi;
  
  // Settings storage
  settings: SettingsApi;
  
  // Job history
  jobs: JobHistoryApi;
  
  // System logs
  logs: LogsApi;
  
  // Plugin data
  plugins: PluginDataApi;
}

export interface UserDataApi {
  create(user: CreateUserRequest): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  list(options?: QueryOptions): Promise<PaginatedResult<User>>;
}

export interface SettingsApi {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  getAll(): Promise<Record<string, any>>;
  getBulk(keys: string[]): Promise<Record<string, any>>;
  setBulk(settings: Record<string, any>): Promise<void>;
}

// Settings implementation
export class SettingsApiClient implements SettingsApi {
  constructor(private apiClient: ApiClient) {}

  async get(key: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/settings/${encodeURIComponent(key)}`);
      return response.value;
    } catch (error) {
      if (error.status === 404) {
        return null; // Setting doesn't exist
      }
      throw error;
    }
  }

  async set(key: string, value: any): Promise<void> {
    await this.apiClient.put(`/settings/${encodeURIComponent(key)}`, {
      body: { value }
    });
  }

  async getAll(): Promise<Record<string, any>> {
    const response = await this.apiClient.get('/settings');
    return response.settings;
  }

  async getBulk(keys: string[]): Promise<Record<string, any>> {
    const response = await this.apiClient.post('/settings/bulk', {
      body: { keys }
    });
    return response.settings;
  }

  async setBulk(settings: Record<string, any>): Promise<void> {
    await this.apiClient.post('/settings/bulk-set', {
      body: { settings }
    });
  }
}
```

### Job History API

```typescript
// src/services/database/jobs.ts
export interface JobHistoryApi {
  create(job: CreateJobRequest): Promise<Job>;
  update(id: string, updates: Partial<Job>): Promise<Job>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Job | null>;
  list(options?: JobQueryOptions): Promise<PaginatedResult<Job>>;
  getStats(): Promise<JobStats>;
}

export interface Job {
  id: string;
  name: string;
  description?: string;
  gcode: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  machineId: string;
  userId: string;
  metadata: Record<string, any>;
  created: Date;
  updated: Date;
}

export interface JobStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalDuration: number;
  averageDuration: number;
  successRate: number;
}

export class JobHistoryApiClient implements JobHistoryApi {
  constructor(private apiClient: ApiClient) {}

  async create(job: CreateJobRequest): Promise<Job> {
    return this.apiClient.post('/jobs', {
      body: job
    });
  }

  async list(options: JobQueryOptions = {}): Promise<PaginatedResult<Job>> {
    const params = new URLSearchParams();
    
    if (options.status) params.append('status', options.status);
    if (options.machineId) params.append('machineId', options.machineId);
    if (options.userId) params.append('userId', options.userId);
    if (options.startDate) params.append('startDate', options.startDate.toISOString());
    if (options.endDate) params.append('endDate', options.endDate.toISOString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());

    return this.apiClient.get(`/jobs?${params.toString()}`);
  }

  async getStats(): Promise<JobStats> {
    return this.apiClient.get('/jobs/stats');
  }
}
```

---

## Plugin API

### Plugin Management

```typescript
// src/services/api/plugins.ts
export interface PluginApi {
  // Plugin store operations
  list(): Promise<Plugin[]>;
  search(query: string): Promise<Plugin[]>;
  getById(id: string): Promise<Plugin>;
  
  // Plugin installation
  install(pluginUrl: string): Promise<InstallResult>;
  uninstall(id: string): Promise<void>;
  update(id: string): Promise<UpdateResult>;
  
  // Plugin management
  enable(id: string): Promise<void>;
  disable(id: string): Promise<void>;
  configure(id: string, config: PluginConfig): Promise<void>;
  
  // Plugin validation
  validate(pluginData: ArrayBuffer): Promise<ValidationResult>;
  checkSignature(pluginData: ArrayBuffer): Promise<SignatureResult>;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  placement: PluginPlacement;
  permissions: string[];
  signature: string;
  verified: boolean;
  installed: boolean;
  enabled: boolean;
  config?: PluginConfig;
  metadata: PluginMetadata;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  signature: SignatureResult;
}

export interface SignatureResult {
  valid: boolean;
  signer: string;
  timestamp: Date;
  trusted: boolean;
}

// Plugin signature verification
export class PluginSignatureVerifier {
  private trustedKeys: Map<string, string> = new Map();

  constructor() {
    this.loadTrustedKeys();
  }

  async verifySignature(pluginData: ArrayBuffer, signature: string): Promise<SignatureResult> {
    try {
      // Parse signature
      const sig = this.parseSignature(signature);
      
      // Verify signature against plugin data
      const isValid = await this.cryptoVerify(pluginData, sig);
      
      // Check if signer is trusted
      const isTrusted = this.trustedKeys.has(sig.signer);
      
      return {
        valid: isValid,
        signer: sig.signer,
        timestamp: sig.timestamp,
        trusted: isTrusted
      };
    } catch (error) {
      return {
        valid: false,
        signer: 'unknown',
        timestamp: new Date(),
        trusted: false
      };
    }
  }

  private parseSignature(signature: string): ParsedSignature {
    // Parse base64 encoded signature
    const decoded = Buffer.from(signature, 'base64');
    const signatureData = JSON.parse(decoded.toString('utf8'));
    
    return {
      signer: signatureData.signer,
      timestamp: new Date(signatureData.timestamp),
      hash: signatureData.hash,
      signature: signatureData.signature
    };
  }

  private async cryptoVerify(data: ArrayBuffer, signature: ParsedSignature): Promise<boolean> {
    // Use Web Crypto API for verification
    const crypto = window.crypto || require('crypto').webcrypto;
    
    // Import public key
    const publicKey = await crypto.subtle.importKey(
      'spki',
      this.getPublicKey(signature.signer),
      { name: 'RSA-PSS', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Verify signature
    return crypto.subtle.verify(
      { name: 'RSA-PSS', saltLength: 32 },
      publicKey,
      Buffer.from(signature.signature, 'base64'),
      data
    );
  }

  private getPublicKey(signer: string): ArrayBuffer {
    const key = this.trustedKeys.get(signer);
    if (!key) {
      throw new Error(`Unknown signer: ${signer}`);
    }
    return Buffer.from(key, 'base64');
  }

  private loadTrustedKeys(): void {
    // Load trusted public keys from secure storage
    const trustedSigners = [
      {
        name: 'official-plugins',
        key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...' // Base64 encoded public key
      }
    ];

    trustedSigners.forEach(signer => {
      this.trustedKeys.set(signer.name, signer.key);
    });
  }
}
```

---

## Real-time Communication

### WebSocket Integration

```typescript
// src/services/api/websocket.ts
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private eventEmitter: EventEmitter;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor(private url: string) {
    this.eventEmitter = new EventEmitter();
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.authenticate();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.handleDisconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private async authenticate(): Promise<void> {
    const token = await TokenManager.getInstance().getValidToken();
    if (token) {
      this.send({
        type: 'auth',
        token
      });
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'position_update':
          this.eventEmitter.emit('positionUpdate', message.data);
          break;
        case 'machine_status':
          this.eventEmitter.emit('machineStatus', message.data);
          break;
        case 'safety_alert':
          this.eventEmitter.emit('safetyAlert', message.data);
          break;
        case 'plugin_event':
          this.eventEmitter.emit('pluginEvent', message.data);
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleDisconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Reconnecting WebSocket (attempt ${this.reconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    } else {
      console.error('Max reconnection attempts reached');
      this.eventEmitter.emit('connectionFailed');
    }
  }

  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent');
    }
  }

  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

---

## Error Handling

### API Error Types

```typescript
// src/services/api/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_REQUIRED');
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public validationErrors: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR', validationErrors);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded', public retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { retryAfter });
    this.name = 'RateLimitError';
  }
}
```

### Error Handling Middleware

```typescript
// src/services/api/error-handler.ts
export class ApiErrorHandler {
  static handle(error: any): never {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new ValidationError(data.message || 'Validation failed', data.errors);
        case 401:
          throw new AuthenticationError(data.message);
        case 403:
          throw new ApiError(data.message || 'Access denied', 403, 'ACCESS_DENIED');
        case 404:
          throw new ApiError(data.message || 'Resource not found', 404, 'NOT_FOUND');
        case 429:
          throw new RateLimitError(data.message, data.retryAfter);
        case 500:
          throw new ApiError(data.message || 'Internal server error', 500, 'SERVER_ERROR');
        default:
          throw new ApiError(data.message || 'Unknown error', status, 'UNKNOWN_ERROR');
      }
    } else if (error.request) {
      // Request made but no response
      throw new NetworkError('No response from server', error);
    } else {
      // Something else happened
      throw new NetworkError('Network error', error);
    }
  }
}
```

---

## Rate Limiting

### Rate Limit Configuration

```typescript
// src/services/api/rate-limiter.ts
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimiter {
  private requestLog: Map<string, number[]> = new Map();
  
  constructor(private config: RateLimitConfig) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Get or create request log for this key
    const requests = this.requestLog.get(key) || [];
    
    // Remove old requests outside the window
    const recentRequests = requests.filter(time => time > windowStart);
    
    // Check if under limit
    if (recentRequests.length >= this.config.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requestLog.set(key, recentRequests);
    
    return true;
  }

  getRemainingRequests(key: string): number {
    const requests = this.requestLog.get(key) || [];
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const recentRequests = requests.filter(time => time > windowStart);
    
    return Math.max(0, this.config.maxRequests - recentRequests.length);
  }

  getResetTime(key: string): number {
    const requests = this.requestLog.get(key) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    return oldestRequest + this.config.windowMs;
  }
}
```

---

## API Client Setup

### Complete API Client Implementation

```typescript
// src/services/api/client.ts
export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private rateLimiter: RateLimiter;
  private interceptors: RequestInterceptor[] = [];

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
    this.rateLimiter = new RateLimiter({
      maxRequests: 100,
      windowMs: 60000 // 100 requests per minute
    });

    this.setupDefaultInterceptors();
  }

  private setupDefaultInterceptors(): void {
    // Authentication interceptor
    this.addInterceptor(async (request) => {
      const token = await TokenManager.getInstance().getValidToken();
      if (token) {
        request.headers.set('Authorization', `Bearer ${token}`);
      }
      return request;
    });

    // Rate limiting interceptor
    this.addInterceptor(async (request) => {
      const key = 'api-requests';
      if (!this.rateLimiter.isAllowed(key)) {
        throw new RateLimitError('Rate limit exceeded');
      }
      return request;
    });

    // Request logging interceptor
    this.addInterceptor(async (request) => {
      console.log(`API Request: ${request.method} ${request.url}`);
      return request;
    });
  }

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'POST' });
  }

  async put<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PUT' });
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  private async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const fullUrl = `${this.baseUrl}${url}`;
    const controller = new AbortController();
    
    // Setup timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, options.timeout || this.timeout);

    try {
      // Create request
      const request = new Request(fullUrl, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });

      // Apply interceptors
      const processedRequest = await this.applyInterceptors(request);

      // Make request
      const response = await fetch(processedRequest);

      // Handle response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          response: {
            status: response.status,
            data: errorData
          }
        };
      }

      // Parse response
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new NetworkError('Request timeout');
      }
      throw ApiErrorHandler.handle(error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async applyInterceptors(request: Request): Promise<Request> {
    let processedRequest = request;
    
    for (const interceptor of this.interceptors) {
      processedRequest = await interceptor(processedRequest);
    }
    
    return processedRequest;
  }

  addInterceptor(interceptor: RequestInterceptor): void {
    this.interceptors.push(interceptor);
  }
}

// Usage example
const apiClient = new ApiClient({
  baseUrl: 'https://api.cnc-controls.com',
  timeout: 30000,
  retryAttempts: 3
});

// Initialize API services
export const api = {
  machine: new MachineApiClient(apiClient),
  workspace: new WorkspaceApiClient(apiClient),
  database: new DatabaseApiClient(apiClient),
  plugins: new PluginApiClient(apiClient),
  auth: new AuthApiClient(apiClient)
};
```

---

## Testing APIs

### API Testing Framework

```typescript
// src/services/api/__tests__/api-client.test.ts
import { ApiClient } from '../client';
import { MockServer } from '../test-utils/mock-server';

describe('ApiClient', () => {
  let apiClient: ApiClient;
  let mockServer: MockServer;

  beforeAll(() => {
    mockServer = new MockServer();
    mockServer.start();
  });

  afterAll(() => {
    mockServer.stop();
  });

  beforeEach(() => {
    apiClient = new ApiClient({
      baseUrl: mockServer.url,
      timeout: 5000,
      retryAttempts: 1
    });
  });

  it('should make GET requests successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockServer.get('/test', mockData);

    const result = await apiClient.get('/test');
    
    expect(result).toEqual(mockData);
  });

  it('should handle authentication errors', async () => {
    mockServer.get('/protected', {}, 401);

    await expect(apiClient.get('/protected')).rejects.toThrow('Authentication required');
  });

  it('should handle rate limiting', async () => {
    // Make multiple requests quickly
    const promises = Array(150).fill(0).map(() => apiClient.get('/test'));
    
    await expect(Promise.all(promises)).rejects.toThrow('Rate limit exceeded');
  });

  it('should retry failed requests', async () => {
    let attempts = 0;
    mockServer.get('/flaky', () => {
      attempts++;
      if (attempts < 3) {
        return { status: 500, body: { error: 'Server error' } };
      }
      return { status: 200, body: { success: true } };
    });

    const result = await apiClient.get('/flaky');
    
    expect(result.success).toBe(true);
    expect(attempts).toBe(3);
  });
});
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. **Authentication Failures**

```typescript
// Debug authentication issues
const debugAuth = async () => {
  const tokenManager = TokenManager.getInstance();
  const token = await tokenManager.getValidToken();
  
  console.log('Token status:', {
    hasToken: !!token,
    tokenLength: token?.length,
    expiresAt: tokenManager.expiresAt,
    isExpired: tokenManager.expiresAt ? Date.now() > tokenManager.expiresAt : null
  });
};
```

#### 2. **Rate Limiting Issues**

```typescript
// Check rate limit status
const checkRateLimit = (apiClient: ApiClient) => {
  const rateLimiter = apiClient.getRateLimiter();
  const remaining = rateLimiter.getRemainingRequests('api-requests');
  const resetTime = rateLimiter.getResetTime('api-requests');
  
  console.log('Rate limit status:', {
    remaining,
    resetTime: new Date(resetTime),
    resetIn: resetTime - Date.now()
  });
};
```

#### 3. **Network Connectivity**

```typescript
// Test API connectivity
const testConnection = async (apiClient: ApiClient) => {
  try {
    const response = await apiClient.get('/health');
    console.log('API is accessible:', response);
  } catch (error) {
    console.error('API connection failed:', error);
    
    if (error instanceof NetworkError) {
      console.log('Network issue detected');
    } else if (error instanceof ApiError) {
      console.log('API error:', error.status, error.code);
    }
  }
};
```

#### 4. **Plugin Signature Verification**

```typescript
// Debug plugin signature issues
const debugPluginSignature = async (pluginData: ArrayBuffer) => {
  const verifier = new PluginSignatureVerifier();
  const result = await verifier.verifySignature(pluginData, signature);
  
  console.log('Signature verification:', {
    valid: result.valid,
    signer: result.signer,
    trusted: result.trusted,
    timestamp: result.timestamp
  });
};
```

This comprehensive API integration guide provides everything needed to work with the various APIs in the CNC Jog Controls application. It covers authentication, error handling, rate limiting, and provides practical examples for all major API interactions.
// API Configuration Types
// Type definitions for API endpoints, networking, and communication configuration schemas

import { LatencyRange } from './CommonTypes';

// API Endpoint Types
export interface MachineEndpoints {
  status: string;
  position: string;
  connect: string;
  disconnect: string;
  home: string;
  jog: string;
  settings: string;
}

export interface WorkspaceEndpoints {
  dimensions: string;
  bounds: string;
  settings: string;
}

export interface SystemEndpoints {
  health: string;
  version: string;
  diagnostics: string;
}

export interface APIEndpoints {
  base: string;
  machine: MachineEndpoints;
  workspace: WorkspaceEndpoints;
  system: SystemEndpoints;
}

// Network Configuration Types
export interface TimeoutConfig {
  default: number;
  position: number;
  status: number;
  connection: number;
}

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier: number;
}

export interface MockConfig {
  enabled: boolean;
  simulateLatency: boolean;
  latencyRange: LatencyRange;
  errorRate: number;
}

// Main API Configuration
export interface APIConfig {
  endpoints: APIEndpoints;
  timeouts: TimeoutConfig;
  retries: RetryConfig;
  mock: MockConfig;
}

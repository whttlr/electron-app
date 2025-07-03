/**
 * API Service Module
 * 
 * Provides unified access to the embedded API server running within Electron.
 * Handles initialization, health checking, and provides type-safe methods
 * for CNC-specific operations.
 */

export { default as apiClient } from './api-client';
export { apiConfig } from './config';
export type { ApiConfig } from './config';

// Re-export commonly used types
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ConnectionStatus {
  connected: boolean;
  port?: string;
  baudRate?: number;
  lastActivity?: string;
}

export interface MachineStatus {
  state: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  workOffset: {
    x: number;
    y: number;
    z: number;
  };
}
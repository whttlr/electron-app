/**
 * MachineController - Core machine state and control logic
 * 
 * This controller manages the overall machine state, connection handling,
 * and provides the core interface for machine operations.
 */

import { machineConfig, type MachineConfig } from './config';

// Core machine state types
export interface MachineState {
  // Connection state
  connection: {
    isConnected: boolean;
    port: string | null;
    baudRate: number;
    lastConnected: Date | null;
    reconnectAttempts: number;
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    error: string | null;
  };
  
  // Machine status
  status: {
    state: 'Idle' | 'Run' | 'Hold' | 'Jog' | 'Alarm' | 'Door' | 'Check' | 'Home' | 'Sleep';
    subState: string | null;
    feedRate: number;
    spindleSpeed: number;
    spindleDirection: 'CW' | 'CCW' | 'Off';
    coolant: {
      flood: boolean;
      mist: boolean;
    };
    overrides: {
      feedRate: number; // percentage
      spindleSpeed: number; // percentage
      rapidRate: number; // percentage
    };
  };
  
  // Position information
  position: {
    work: { x: number; y: number; z: number };
    machine: { x: number; y: number; z: number };
    wco: { x: number; y: number; z: number }; // Work coordinate offset
  };
  
  // Machine limits and capabilities
  limits: {
    softLimits: {
      enabled: boolean;
      min: { x: number; y: number; z: number };
      max: { x: number; y: number; z: number };
    };
    hardLimits: {
      enabled: boolean;
      triggered: boolean;
      axis: string | null;
    };
  };
  
  // Safety and alarms
  safety: {
    emergencyStop: boolean;
    alarms: Array<{
      code: number;
      message: string;
      timestamp: Date;
      severity: 'info' | 'warning' | 'error' | 'critical';
    }>;
    warnings: Array<{
      code: number;
      message: string;
      timestamp: Date;
    }>;
  };
  
  // Machine capabilities
  capabilities: {
    axes: string[];
    hasSpindle: boolean;
    hasProbe: boolean;
    hasCoolant: boolean;
    maxFeedRate: number;
    maxSpindleSpeed: number;
  };
  
  // Real-time data
  realtime: {
    lastUpdate: Date;
    bufferSize: number;
    plannerBlocks: number;
    serialRxBuffer: number;
  };
}

// Machine command types
export interface MachineCommand {
  id: string;
  command: string;
  timestamp: Date;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  callback?: (response: CommandResponse) => void;
}

export interface CommandResponse {
  success: boolean;
  message: string;
  data?: any;
  timestamp: Date;
}

// Event types
export type MachineEvent = 
  | { type: 'connection_changed'; data: { isConnected: boolean; port: string | null } }
  | { type: 'state_changed'; data: { oldState: string; newState: string } }
  | { type: 'position_changed'; data: { position: MachineState['position'] } }
  | { type: 'alarm_triggered'; data: { alarm: MachineState['safety']['alarms'][0] } }
  | { type: 'emergency_stop'; data: { active: boolean } }
  | { type: 'error'; data: { error: string; severity: 'warning' | 'error' | 'critical' } };

export type MachineEventHandler = (event: MachineEvent) => void;

/**
 * MachineController - Main machine control interface
 */
export class MachineController {
  private state: MachineState;
  private config: MachineConfig;
  private eventHandlers: Map<string, Set<MachineEventHandler>> = new Map();
  private commandQueue: MachineCommand[] = [];
  private isProcessingCommands = false;
  private statusTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(config: MachineConfig = machineConfig) {
    this.config = config;
    this.state = this.createInitialState();
    this.initializeEventHandlers();
  }

  /**
   * Initialize the machine controller
   */
  async initialize(): Promise<void> {
    try {
      // Set up status monitoring
      this.startStatusMonitoring();
      
      // Emit initialization event
      this.emit('initialized', { timestamp: new Date() });
      
      console.log('MachineController initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MachineController:', error);
      throw error;
    }
  }

  /**
   * Connect to the machine
   */
  async connect(port: string, baudRate: number = this.config.connection.defaultBaudRate): Promise<boolean> {
    try {
      // Update connection state
      this.updateConnectionState({
        status: 'connecting',
        port,
        baudRate,
        error: null
      });

      // Simulate connection process (replace with actual connection logic)
      await this.simulateConnection(port, baudRate);

      // Update state on successful connection
      this.updateConnectionState({
        isConnected: true,
        status: 'connected',
        lastConnected: new Date(),
        reconnectAttempts: 0
      });

      // Start real-time monitoring
      this.startRealTimeMonitoring();

      return true;
    } catch (error) {
      this.handleConnectionError(error as Error);
      return false;
    }
  }

  /**
   * Disconnect from the machine
   */
  async disconnect(): Promise<void> {
    try {
      // Stop monitoring
      this.stopRealTimeMonitoring();
      
      // Update connection state
      this.updateConnectionState({
        isConnected: false,
        status: 'disconnected',
        port: null,
        error: null
      });

      // Clear command queue
      this.commandQueue = [];
      
      console.log('Disconnected from machine');
    } catch (error) {
      console.error('Error during disconnect:', error);
      throw error;
    }
  }

  /**
   * Send a command to the machine
   */
  async sendCommand(command: string, priority: MachineCommand['priority'] = 'normal'): Promise<CommandResponse> {
    return new Promise((resolve, reject) => {
      const machineCommand: MachineCommand = {
        id: this.generateCommandId(),
        command,
        timestamp: new Date(),
        priority,
        callback: resolve
      };

      // Add to queue based on priority
      this.enqueueCommand(machineCommand);
      
      // Process queue if not already processing
      if (!this.isProcessingCommands) {
        this.processCommandQueue();
      }
    });
  }

  /**
   * Emergency stop - immediate halt of all operations
   */
  async emergencyStop(): Promise<void> {
    try {
      // Set emergency stop state
      this.state.safety.emergencyStop = true;
      
      // Send emergency stop command with highest priority
      await this.sendCommand('!', 'emergency');
      
      // Update machine state
      this.state.status.state = 'Alarm';
      
      // Emit emergency stop event
      this.emit('emergency_stop', { active: true });
      
      console.log('Emergency stop activated');
    } catch (error) {
      console.error('Failed to execute emergency stop:', error);
      throw error;
    }
  }

  /**
   * Reset the machine from alarm state
   */
  async reset(): Promise<void> {
    try {
      // Clear emergency stop
      this.state.safety.emergencyStop = false;
      
      // Send reset command
      await this.sendCommand('$X');
      
      // Clear alarms
      this.state.safety.alarms = [];
      
      // Reset machine state
      this.state.status.state = 'Idle';
      
      console.log('Machine reset completed');
    } catch (error) {
      console.error('Failed to reset machine:', error);
      throw error;
    }
  }

  /**
   * Get current machine state
   */
  getState(): Readonly<MachineState> {
    return { ...this.state };
  }

  /**
   * Get machine configuration
   */
  getConfig(): Readonly<MachineConfig> {
    return { ...this.config };
  }

  /**
   * Update machine configuration
   */
  updateConfig(newConfig: Partial<MachineConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Machine configuration updated');
  }

  /**
   * Check if machine is connected
   */
  isConnected(): boolean {
    return this.state.connection.isConnected;
  }

  /**
   * Check if machine is ready for operations
   */
  isReady(): boolean {
    return this.isConnected() && 
           this.state.status.state === 'Idle' && 
           !this.state.safety.emergencyStop;
  }

  /**
   * Event subscription methods
   */
  on(event: string, handler: MachineEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: MachineEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    // Stop timers
    if (this.statusTimer) {
      clearInterval(this.statusTimer);
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    // Disconnect if connected
    if (this.isConnected()) {
      await this.disconnect();
    }
    
    // Clear event handlers
    this.eventHandlers.clear();
    
    console.log('MachineController disposed');
  }

  // Private methods

  private createInitialState(): MachineState {
    return {
      connection: {
        isConnected: false,
        port: null,
        baudRate: this.config.connection.defaultBaudRate,
        lastConnected: null,
        reconnectAttempts: 0,
        status: 'disconnected',
        error: null
      },
      status: {
        state: 'Idle',
        subState: null,
        feedRate: this.config.limits.feedRate.default,
        spindleSpeed: this.config.limits.spindleSpeed.default,
        spindleDirection: 'Off',
        coolant: {
          flood: false,
          mist: false
        },
        overrides: {
          feedRate: 100,
          spindleSpeed: 100,
          rapidRate: 100
        }
      },
      position: {
        work: { x: 0, y: 0, z: 0 },
        machine: { x: 0, y: 0, z: 0 },
        wco: { x: 0, y: 0, z: 0 }
      },
      limits: {
        softLimits: {
          enabled: this.config.safety.enableSoftLimits,
          min: { 
            x: this.config.limits.workingArea.x.min,
            y: this.config.limits.workingArea.y.min,
            z: this.config.limits.workingArea.z.min
          },
          max: { 
            x: this.config.limits.workingArea.x.max,
            y: this.config.limits.workingArea.y.max,
            z: this.config.limits.workingArea.z.max
          }
        },
        hardLimits: {
          enabled: true,
          triggered: false,
          axis: null
        }
      },
      safety: {
        emergencyStop: false,
        alarms: [],
        warnings: []
      },
      capabilities: {
        axes: ['X', 'Y', 'Z'],
        hasSpindle: true,
        hasProbe: false,
        hasCoolant: true,
        maxFeedRate: this.config.limits.feedRate.max,
        maxSpindleSpeed: this.config.limits.spindleSpeed.max
      },
      realtime: {
        lastUpdate: new Date(),
        bufferSize: 0,
        plannerBlocks: 0,
        serialRxBuffer: 0
      }
    };
  }

  private initializeEventHandlers(): void {
    // Initialize event handler sets
    const events = ['connection_changed', 'state_changed', 'position_changed', 'alarm_triggered', 'emergency_stop', 'error'];
    events.forEach(event => {
      this.eventHandlers.set(event, new Set());
    });
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler({ type: event, data } as MachineEvent);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  private updateConnectionState(updates: Partial<MachineState['connection']>): void {
    const oldState = { ...this.state.connection };
    this.state.connection = { ...this.state.connection, ...updates };
    
    // Emit connection change event
    this.emit('connection_changed', {
      isConnected: this.state.connection.isConnected,
      port: this.state.connection.port
    });
  }

  private async simulateConnection(port: string, baudRate: number): Promise<void> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For now, simulate successful connection
    // In a real implementation, this would establish actual serial communication
    console.log(`Simulated connection to ${port} at ${baudRate} baud`);
  }

  private handleConnectionError(error: Error): void {
    this.updateConnectionState({
      status: 'error',
      error: error.message,
      reconnectAttempts: this.state.connection.reconnectAttempts + 1
    });

    // Attempt auto-reconnect if enabled
    if (this.config.connection.autoReconnect && 
        this.state.connection.reconnectAttempts < this.config.connection.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      if (this.state.connection.port) {
        this.connect(this.state.connection.port, this.state.connection.baudRate);
      }
    }, this.config.connection.autoReconnectDelay);
  }

  private startStatusMonitoring(): void {
    if (this.statusTimer) {
      clearInterval(this.statusTimer);
    }

    this.statusTimer = setInterval(() => {
      this.updateRealtimeData();
    }, this.config.monitoring.statusPollInterval);
  }

  private startRealTimeMonitoring(): void {
    // Start position monitoring
    this.startPositionMonitoring();
  }

  private stopRealTimeMonitoring(): void {
    // Stop monitoring timers
    if (this.statusTimer) {
      clearInterval(this.statusTimer);
      this.statusTimer = null;
    }
  }

  private startPositionMonitoring(): void {
    // Position monitoring would be implemented here
    // For now, simulate position updates
    if (this.config.monitoring.enableRealTimeTracking) {
      setInterval(() => {
        this.updatePositionData();
      }, this.config.monitoring.positionUpdateInterval);
    }
  }

  private updateRealtimeData(): void {
    this.state.realtime.lastUpdate = new Date();
    // Update other realtime data as needed
  }

  private updatePositionData(): void {
    // Simulate position updates
    // In a real implementation, this would receive position data from the machine
    this.emit('position_changed', {
      position: this.state.position
    });
  }

  private generateCommandId(): string {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private enqueueCommand(command: MachineCommand): void {
    // Insert command based on priority
    const priorityOrder = { emergency: 0, high: 1, normal: 2, low: 3 };
    const insertIndex = this.commandQueue.findIndex(
      cmd => priorityOrder[cmd.priority] > priorityOrder[command.priority]
    );
    
    if (insertIndex === -1) {
      this.commandQueue.push(command);
    } else {
      this.commandQueue.splice(insertIndex, 0, command);
    }
  }

  private async processCommandQueue(): Promise<void> {
    if (this.isProcessingCommands || this.commandQueue.length === 0) {
      return;
    }

    this.isProcessingCommands = true;

    while (this.commandQueue.length > 0) {
      const command = this.commandQueue.shift()!;
      
      try {
        const response = await this.executeCommand(command);
        if (command.callback) {
          command.callback(response);
        }
      } catch (error) {
        const errorResponse: CommandResponse = {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        };
        
        if (command.callback) {
          command.callback(errorResponse);
        }
      }
    }

    this.isProcessingCommands = false;
  }

  private async executeCommand(command: MachineCommand): Promise<CommandResponse> {
    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // In a real implementation, this would send the command to the machine
    console.log(`Executing command: ${command.command}`);
    
    return {
      success: true,
      message: 'Command executed successfully',
      timestamp: new Date()
    };
  }
}

// Export singleton instance
export const machineController = new MachineController();
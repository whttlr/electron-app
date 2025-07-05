/**
 * PositioningController - Position tracking and jog controls
 * 
 * This controller manages machine positioning, jogging operations,
 * coordinate systems, and position tracking functionality.
 */

import { positioningConfig, type PositioningConfig } from './config';

// Position and coordinate types
export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface CoordinateSystem {
  name: string;
  offset: Position;
  active: boolean;
}

export interface JogSettings {
  distance: number;
  feedRate: number;
  mode: 'incremental' | 'continuous';
  axes: ('X' | 'Y' | 'Z')[];
}

export interface JogCommand {
  axis: 'X' | 'Y' | 'Z';
  direction: 1 | -1; // 1 for positive, -1 for negative
  distance: number;
  feedRate: number;
  mode: 'incremental' | 'continuous';
}

export interface PositionHistory {
  timestamp: Date;
  position: Position;
  feedRate: number;
  command: string;
}

export interface HomingSettings {
  enabled: boolean;
  sequence: ('X' | 'Y' | 'Z')[];
  feedRates: {
    fast: number;
    slow: number;
  };
  postMoveDistance: number;
}

// Position tracking state
export interface PositioningState {
  // Current positions
  current: {
    work: Position;
    machine: Position;
    wco: Position; // Work coordinate offset
  };
  
  // Target position for moves
  target: Position;
  
  // Position tracking
  tracking: {
    isTracking: boolean;
    lastUpdate: Date;
    changeThreshold: number;
    history: PositionHistory[];
    maxHistoryLength: number;
  };
  
  // Coordinate systems
  coordinateSystems: CoordinateSystem[];
  activeCoordinateSystem: string;
  
  // Jogging state
  jogging: {
    isJogging: boolean;
    currentJog: JogCommand | null;
    settings: JogSettings;
    availableDistances: number[];
    continuousJogging: {
      active: boolean;
      axes: Set<string>;
      startTime: Date | null;
    };
  };
  
  // Homing state
  homing: {
    isHoming: boolean;
    currentAxis: string | null;
    completed: boolean;
    homePosition: Position;
    settings: HomingSettings;
  };
  
  // Movement constraints
  constraints: {
    softLimits: {
      enabled: boolean;
      min: Position;
      max: Position;
    };
    feedRateLimit: {
      min: number;
      max: number;
    };
  };
  
  // Units and precision
  units: 'mm' | 'inch';
  precision: number;
}

// Event types for positioning
export type PositioningEvent = 
  | { type: 'position_changed'; data: { position: Position; timestamp: Date } }
  | { type: 'jog_started'; data: { command: JogCommand } }
  | { type: 'jog_completed'; data: { command: JogCommand; finalPosition: Position } }
  | { type: 'jog_stopped'; data: { reason: string } }
  | { type: 'homing_started'; data: { axis: string | null } }
  | { type: 'homing_completed'; data: { success: boolean; position: Position } }
  | { type: 'coordinate_system_changed'; data: { system: string; offset: Position } }
  | { type: 'soft_limit_triggered'; data: { axis: string; limit: 'min' | 'max' } };

export type PositioningEventHandler = (event: PositioningEvent) => void;

/**
 * PositioningController - Main positioning control interface
 */
export class PositioningController {
  private state: PositioningState;
  private config: PositioningConfig;
  private eventHandlers: Map<string, Set<PositioningEventHandler>> = new Map();
  private trackingTimer: NodeJS.Timeout | null = null;
  private jogTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor(config: PositioningConfig = positioningConfig) {
    this.config = config;
    this.state = this.createInitialState();
    this.initializeEventHandlers();
  }

  /**
   * Initialize the positioning controller
   */
  async initialize(): Promise<void> {
    try {
      // Set up position tracking
      if (this.config.tracking.updateFrequency > 0) {
        this.startPositionTracking();
      }
      
      // Initialize coordinate systems
      this.initializeCoordinateSystems();
      
      this.isInitialized = true;
      console.log('PositioningController initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PositioningController:', error);
      throw error;
    }
  }

  /**
   * Update current position
   */
  updatePosition(workPosition: Position, machinePosition?: Position): void {
    const oldPosition = { ...this.state.current.work };
    
    // Update work position
    this.state.current.work = { ...workPosition };
    
    // Update machine position if provided
    if (machinePosition) {
      this.state.current.machine = { ...machinePosition };
    }
    
    // Calculate work coordinate offset
    this.state.current.wco = {
      x: this.state.current.machine.x - this.state.current.work.x,
      y: this.state.current.machine.y - this.state.current.work.y,
      z: this.state.current.machine.z - this.state.current.work.z
    };
    
    // Check if position changed significantly
    const hasChanged = this.hasPositionChanged(oldPosition, workPosition);
    
    if (hasChanged) {
      // Update tracking
      this.state.tracking.lastUpdate = new Date();
      
      // Add to history if enabled
      if (this.config.tracking.enableHistory) {
        this.addToHistory(workPosition);
      }
      
      // Emit position change event
      this.emit('position_changed', {
        position: workPosition,
        timestamp: new Date()
      });
    }
  }

  /**
   * Start incremental jog operation
   */
  async jogIncremental(axis: 'X' | 'Y' | 'Z', direction: 1 | -1, distance?: number, feedRate?: number): Promise<boolean> {
    if (this.state.jogging.isJogging) {
      console.warn('Jog operation already in progress');
      return false;
    }
    
    const jogDistance = distance || this.state.jogging.settings.distance;
    const jogFeedRate = feedRate || this.state.jogging.settings.feedRate;
    
    // Validate jog parameters
    if (!this.validateJogCommand(axis, direction, jogDistance)) {
      return false;
    }
    
    const jogCommand: JogCommand = {
      axis,
      direction,
      distance: jogDistance,
      feedRate: jogFeedRate,
      mode: 'incremental'
    };
    
    try {
      // Start jog operation
      this.state.jogging.isJogging = true;
      this.state.jogging.currentJog = jogCommand;
      
      // Emit jog started event
      this.emit('jog_started', { command: jogCommand });
      
      // Execute jog command
      await this.executeJogCommand(jogCommand);
      
      return true;
    } catch (error) {
      console.error('Jog operation failed:', error);
      this.stopJog('error');
      return false;
    }
  }

  /**
   * Start continuous jog operation
   */
  async jogContinuous(axis: 'X' | 'Y' | 'Z', direction: 1 | -1, feedRate?: number): Promise<boolean> {
    if (!this.config.jogging.enableContinuous) {
      console.warn('Continuous jogging is disabled');
      return false;
    }
    
    const jogFeedRate = feedRate || this.config.jogging.continuousFeedRate;
    
    const jogCommand: JogCommand = {
      axis,
      direction,
      distance: 0, // Continuous mode
      feedRate: jogFeedRate,
      mode: 'continuous'
    };
    
    try {
      // Start continuous jog
      this.state.jogging.continuousJogging.active = true;
      this.state.jogging.continuousJogging.axes.add(axis);
      this.state.jogging.continuousJogging.startTime = new Date();
      this.state.jogging.currentJog = jogCommand;
      
      // Emit jog started event
      this.emit('jog_started', { command: jogCommand });
      
      // Execute continuous jog
      await this.executeContinuousJog(jogCommand);
      
      return true;
    } catch (error) {
      console.error('Continuous jog failed:', error);
      this.stopJog('error');
      return false;
    }
  }

  /**
   * Stop current jog operation
   */
  stopJog(reason: string = 'user_request'): void {
    if (!this.state.jogging.isJogging && !this.state.jogging.continuousJogging.active) {
      return;
    }
    
    // Stop jog timers
    if (this.jogTimer) {
      clearTimeout(this.jogTimer);
      this.jogTimer = null;
    }
    
    // Update jog state
    this.state.jogging.isJogging = false;
    this.state.jogging.continuousJogging.active = false;
    this.state.jogging.continuousJogging.axes.clear();
    
    const currentJog = this.state.jogging.currentJog;
    this.state.jogging.currentJog = null;
    
    // Emit jog stopped event
    this.emit('jog_stopped', { reason });
    
    console.log(`Jog operation stopped: ${reason}`);
  }

  /**
   * Start homing sequence
   */
  async homeAxes(axes?: ('X' | 'Y' | 'Z')[]): Promise<boolean> {
    if (this.state.homing.isHoming) {
      console.warn('Homing operation already in progress');
      return false;
    }
    
    const homingAxes = axes || this.config.homing.homingOrder;
    
    try {
      this.state.homing.isHoming = true;
      this.state.homing.completed = false;
      
      // Emit homing started event
      this.emit('homing_started', { axis: null });
      
      // Home each axis in sequence
      for (const axis of homingAxes) {
        this.state.homing.currentAxis = axis;
        await this.homeAxis(axis);
      }
      
      // Homing completed
      this.state.homing.isHoming = false;
      this.state.homing.completed = true;
      this.state.homing.currentAxis = null;
      
      // Move to post-homing position
      if (this.config.homing.postHomingMove > 0) {
        await this.moveToPostHomingPosition();
      }
      
      // Emit homing completed event
      this.emit('homing_completed', {
        success: true,
        position: this.state.current.work
      });
      
      return true;
    } catch (error) {
      console.error('Homing operation failed:', error);
      this.state.homing.isHoming = false;
      this.state.homing.currentAxis = null;
      
      this.emit('homing_completed', {
        success: false,
        position: this.state.current.work
      });
      
      return false;
    }
  }

  /**
   * Set work coordinate system offset
   */
  setWorkCoordinateOffset(system: string, offset: Position): boolean {
    const coordinateSystem = this.state.coordinateSystems.find(cs => cs.name === system);
    if (!coordinateSystem) {
      console.warn(`Coordinate system ${system} not found`);
      return false;
    }
    
    coordinateSystem.offset = { ...offset };
    
    // If this is the active system, update current positions
    if (system === this.state.activeCoordinateSystem) {
      this.updateWorkCoordinateSystem(system);
    }
    
    return true;
  }

  /**
   * Switch active coordinate system
   */
  switchCoordinateSystem(system: string): boolean {
    const coordinateSystem = this.state.coordinateSystems.find(cs => cs.name === system);
    if (!coordinateSystem) {
      console.warn(`Coordinate system ${system} not found`);
      return false;
    }
    
    // Update active system
    this.state.coordinateSystems.forEach(cs => {
      cs.active = cs.name === system;
    });
    
    this.state.activeCoordinateSystem = system;
    
    // Update coordinate system
    this.updateWorkCoordinateSystem(system);
    
    return true;
  }

  /**
   * Get current positioning state
   */
  getState(): Readonly<PositioningState> {
    return { ...this.state };
  }

  /**
   * Get current position
   */
  getCurrentPosition(): Readonly<Position> {
    return { ...this.state.current.work };
  }

  /**
   * Get position history
   */
  getPositionHistory(): Readonly<PositionHistory[]> {
    return [...this.state.tracking.history];
  }

  /**
   * Update jog settings
   */
  updateJogSettings(settings: Partial<JogSettings>): void {
    this.state.jogging.settings = { ...this.state.jogging.settings, ...settings };
  }

  /**
   * Check if position is within soft limits
   */
  isWithinSoftLimits(position: Position): boolean {
    if (!this.state.constraints.softLimits.enabled) {
      return true;
    }
    
    const { min, max } = this.state.constraints.softLimits;
    
    return position.x >= min.x && position.x <= max.x &&
           position.y >= min.y && position.y <= max.y &&
           position.z >= min.z && position.z <= max.z;
  }

  /**
   * Event subscription methods
   */
  on(event: string, handler: PositioningEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: PositioningEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    // Stop position tracking
    if (this.trackingTimer) {
      clearInterval(this.trackingTimer);
      this.trackingTimer = null;
    }
    
    // Stop any active jog
    this.stopJog('dispose');
    
    // Clear event handlers
    this.eventHandlers.clear();
    
    this.isInitialized = false;
    console.log('PositioningController disposed');
  }

  // Private methods

  private createInitialState(): PositioningState {
    return {
      current: {
        work: { x: 0, y: 0, z: 0 },
        machine: { x: 0, y: 0, z: 0 },
        wco: { x: 0, y: 0, z: 0 }
      },
      target: { x: 0, y: 0, z: 0 },
      tracking: {
        isTracking: false,
        lastUpdate: new Date(),
        changeThreshold: this.config.tracking.changeThreshold,
        history: [],
        maxHistoryLength: this.config.tracking.historyLength
      },
      coordinateSystems: [],
      activeCoordinateSystem: this.config.coordinates.defaultSystem,
      jogging: {
        isJogging: false,
        currentJog: null,
        settings: {
          distance: this.config.jogging.defaultDistances[1],
          feedRate: this.config.jogging.defaultFeedRate,
          mode: 'incremental',
          axes: ['X', 'Y', 'Z']
        },
        availableDistances: [...this.config.jogging.defaultDistances],
        continuousJogging: {
          active: false,
          axes: new Set(),
          startTime: null
        }
      },
      homing: {
        isHoming: false,
        currentAxis: null,
        completed: false,
        homePosition: { x: 0, y: 0, z: 0 },
        settings: {
          enabled: true,
          sequence: [...this.config.homing.homingOrder],
          feedRates: { ...this.config.homing.homingFeedRate },
          postMoveDistance: this.config.homing.postHomingMove
        }
      },
      constraints: {
        softLimits: {
          enabled: false,
          min: { x: 0, y: 0, z: 0 },
          max: { x: 100, y: 100, z: 100 }
        },
        feedRateLimit: {
          min: 1,
          max: 3000
        }
      },
      units: this.config.coordinates.defaultUnits,
      precision: this.config.coordinates.decimalPlaces
    };
  }

  private initializeEventHandlers(): void {
    const events = ['position_changed', 'jog_started', 'jog_completed', 'jog_stopped', 
                   'homing_started', 'homing_completed', 'coordinate_system_changed', 'soft_limit_triggered'];
    events.forEach(event => {
      this.eventHandlers.set(event, new Set());
    });
  }

  private initializeCoordinateSystems(): void {
    // Initialize coordinate systems
    this.config.coordinates.availableSystems.forEach(system => {
      this.state.coordinateSystems.push({
        name: system,
        offset: { x: 0, y: 0, z: 0 },
        active: system === this.config.coordinates.defaultSystem
      });
    });
  }

  private startPositionTracking(): void {
    if (this.trackingTimer) {
      clearInterval(this.trackingTimer);
    }
    
    const interval = 1000 / this.config.tracking.updateFrequency;
    this.trackingTimer = setInterval(() => {
      this.state.tracking.isTracking = true;
      // Position tracking logic would go here
      // For now, just update the timestamp
      this.state.tracking.lastUpdate = new Date();
    }, interval);
  }

  private hasPositionChanged(oldPosition: Position, newPosition: Position): boolean {
    const threshold = this.state.tracking.changeThreshold;
    return Math.abs(newPosition.x - oldPosition.x) > threshold ||
           Math.abs(newPosition.y - oldPosition.y) > threshold ||
           Math.abs(newPosition.z - oldPosition.z) > threshold;
  }

  private addToHistory(position: Position): void {
    const historyEntry: PositionHistory = {
      timestamp: new Date(),
      position: { ...position },
      feedRate: this.state.jogging.settings.feedRate,
      command: 'position_update'
    };
    
    this.state.tracking.history.push(historyEntry);
    
    // Limit history size
    if (this.state.tracking.history.length > this.state.tracking.maxHistoryLength) {
      this.state.tracking.history.shift();
    }
  }

  private validateJogCommand(axis: 'X' | 'Y' | 'Z', direction: 1 | -1, distance: number): boolean {
    // Calculate target position
    const currentPos = this.state.current.work;
    const targetPos = { ...currentPos };
    targetPos[axis.toLowerCase() as keyof Position] += direction * distance;
    
    // Check soft limits
    if (this.state.constraints.softLimits.enabled && !this.isWithinSoftLimits(targetPos)) {
      console.warn(`Jog command would exceed soft limits on ${axis} axis`);
      this.emit('soft_limit_triggered', {
        axis,
        limit: direction > 0 ? 'max' : 'min'
      });
      return false;
    }
    
    return true;
  }

  private async executeJogCommand(command: JogCommand): Promise<void> {
    // Simulate jog execution
    const jogTime = (command.distance / command.feedRate) * 60 * 1000; // Convert to milliseconds
    
    return new Promise((resolve, reject) => {
      this.jogTimer = setTimeout(() => {
        // Calculate final position
        const finalPosition = { ...this.state.current.work };
        finalPosition[command.axis.toLowerCase() as keyof Position] += command.direction * command.distance;
        
        // Update position
        this.updatePosition(finalPosition);
        
        // Complete jog
        this.state.jogging.isJogging = false;
        this.state.jogging.currentJog = null;
        
        // Emit jog completed event
        this.emit('jog_completed', {
          command,
          finalPosition
        });
        
        resolve();
      }, Math.min(jogTime, 5000)); // Max 5 seconds for simulation
    });
  }

  private async executeContinuousJog(command: JogCommand): Promise<void> {
    // Continuous jog logic would be implemented here
    // For now, just log the command
    console.log(`Starting continuous jog: ${command.axis} ${command.direction > 0 ? '+' : '-'} at ${command.feedRate} mm/min`);
  }

  private async homeAxis(axis: 'X' | 'Y' | 'Z'): Promise<void> {
    // Simulate homing operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Set home position
    const homePosition = { ...this.state.current.work };
    homePosition[axis.toLowerCase() as keyof Position] = 0;
    
    this.updatePosition(homePosition);
    console.log(`Axis ${axis} homed successfully`);
  }

  private async moveToPostHomingPosition(): Promise<void> {
    // Move to post-homing position
    const postPosition = { ...this.state.homing.homePosition };
    postPosition.x += this.config.homing.postHomingMove;
    postPosition.y += this.config.homing.postHomingMove;
    
    this.updatePosition(postPosition);
  }

  private updateWorkCoordinateSystem(system: string): void {
    const coordinateSystem = this.state.coordinateSystems.find(cs => cs.name === system);
    if (coordinateSystem) {
      // Update work coordinate offset
      this.state.current.wco = { ...coordinateSystem.offset };
      
      // Emit coordinate system change event
      this.emit('coordinate_system_changed', {
        system,
        offset: coordinateSystem.offset
      });
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler({ type: event, data } as PositioningEvent);
        } catch (error) {
          console.error(`Error in positioning event handler for ${event}:`, error);
        }
      });
    }
  }
}

// Export singleton instance
export const positioningController = new PositioningController();
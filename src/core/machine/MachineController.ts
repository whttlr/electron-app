import { Position, MachineEvent, MachineEventListener, MachineEventType } from './MachineTypes';
import { MachineState } from './MachineState';
import { logger } from '@/services/logger';
import machineConfig from '@config/machine.json';

export class MachineController {
  private state: MachineState;
  private eventListeners: Map<MachineEventType, Set<MachineEventListener>>;

  constructor() {
    this.state = new MachineState();
    this.eventListeners = new Map();
  }

  // Connection Management
  async connect(): Promise<void> {
    logger.info('Connecting to machine...');
    
    try {
      // Simulate connection process
      await this.simulateDelay(500);
      
      this.state.setConnected(true);
      this.emitEvent('connected');
      logger.info('Machine connected successfully');
    } catch (error) {
      logger.error('Failed to connect to machine', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    logger.info('Disconnecting from machine...');
    
    try {
      await this.simulateDelay(200);
      
      this.state.setConnected(false);
      // Reset position to zero on disconnect
      this.state.setPosition({ x: 0, y: 0, z: 0 });
      this.state.setMoving(false);
      this.state.setHoming(false);
      this.emitEvent('disconnected');
      logger.info('Machine disconnected successfully');
    } catch (error) {
      logger.error('Failed to disconnect from machine', error);
      throw error;
    }
  }

  // Position Management
  async moveToPosition(targetPosition: Partial<Position>): Promise<void> {
    if (!this.state.isConnected()) {
      throw new Error('Machine not connected');
    }

    if (this.state.isMoving()) {
      throw new Error('Machine is already moving');
    }

    this.state.setMoving(true);
    const currentPosition = this.state.getPosition();
    const newPosition = { ...currentPosition, ...targetPosition };

    logger.info('Moving to position', newPosition);

    try {
      // Validate position is within bounds
      this.validatePosition(newPosition);
      
      // Simulate movement
      await this.simulateDelay(1000);
      
      this.state.setPosition(newPosition);
      this.state.setMoving(false);
      
      this.emitEvent('positionChanged', newPosition);
      logger.info('Position changed successfully', newPosition);
    } catch (error) {
      this.state.setMoving(false);
      logger.error('Failed to move to position', error);
      throw error;
    }
  }

  async jog(axis: keyof Position, distance: number): Promise<void> {
    const currentPosition = this.state.getPosition();
    const newPosition = {
      ...currentPosition,
      [axis]: currentPosition[axis] + distance
    };

    await this.moveToPosition(newPosition);
  }

  async home(): Promise<void> {
    if (!this.state.isConnected()) {
      throw new Error('Machine not connected');
    }

    if (this.state.isHoming()) {
      throw new Error('Machine is already homing');
    }

    logger.info('Starting homing sequence...');
    this.state.setHoming(true);
    this.emitEvent('homingStarted');

    try {
      await this.simulateDelay(2000);
      
      // Home position is typically 0,0,0
      this.state.setPosition({ x: 0, y: 0, z: 0 });
      this.state.setHoming(false);
      
      this.emitEvent('homingCompleted');
      logger.info('Homing completed successfully');
    } catch (error) {
      this.state.setHoming(false);
      logger.error('Homing failed', error);
      throw error;
    }
  }

  // State Getters
  getState() {
    return this.state.get();
  }

  getPosition(): Position {
    return this.state.getPosition();
  }

  getDimensions() {
    return this.state.getDimensions();
  }

  isConnected(): boolean {
    return this.state.isConnected();
  }

  // Event Management
  on(eventType: MachineEventType, listener: MachineEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  off(eventType: MachineEventType, listener: MachineEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  private emitEvent(type: MachineEventType, data?: any): void {
    const event: MachineEvent = {
      type,
      data,
      timestamp: new Date()
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }

  // Validation
  private validatePosition(position: Position): void {
    const dimensions = this.state.getDimensions();
    
    if (position.x < 0 || position.x > dimensions.width) {
      throw new Error(`X position ${position.x} is out of bounds`);
    }
    
    if (position.y < 0 || position.y > dimensions.height) {
      throw new Error(`Y position ${position.y} is out of bounds`);
    }
    
    if (position.z < 0 || position.z > dimensions.depth) {
      throw new Error(`Z position ${position.z} is out of bounds`);
    }
  }

  // Utility
  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
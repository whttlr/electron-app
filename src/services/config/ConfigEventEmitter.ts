// Configuration Event Management
// Handles event system for configuration changes and notifications

import { ConfigEvent, ConfigEventType } from './types/index';

type ConfigEventListener = (event: ConfigEvent) => void;

export class ConfigEventEmitter {
  private eventListeners: Map<ConfigEventType, ConfigEventListener[]> = new Map();

  constructor() {
    // Initialize event listener arrays
    Object.values(['loaded', 'error', 'updated', 'reset'] as ConfigEventType[]).forEach((type) => {
      this.eventListeners.set(type, []);
    });
  }

  /**
   * Add event listener
   */
  public addEventListener(type: ConfigEventType, listener: ConfigEventListener): void {
    const listeners = this.eventListeners.get(type) || [];
    listeners.push(listener);
    this.eventListeners.set(type, listeners);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(type: ConfigEventType, listener: ConfigEventListener): void {
    const listeners = this.eventListeners.get(type) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Emit event to all registered listeners
   */
  public emitEvent(type: ConfigEventType, data?: any, error?: Error): void {
    const event: ConfigEvent = {
      type,
      timestamp: new Date(),
      data,
      error,
    };

    const listeners = this.eventListeners.get(type) || [];
    listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in config event listener for ${type}:`, error);
      }
    });
  }

  /**
   * Clear all event listeners
   */
  public clearEventListeners(): void {
    this.eventListeners.clear();
    // Re-initialize event listener arrays
    Object.values(['loaded', 'error', 'updated', 'reset'] as ConfigEventType[]).forEach((type) => {
      this.eventListeners.set(type, []);
    });
  }

  /**
   * Get count of listeners for a specific event type
   */
  public getListenerCount(type: ConfigEventType): number {
    return this.eventListeners.get(type)?.length || 0;
  }

  /**
   * Check if there are any listeners for a specific event type
   */
  public hasListeners(type: ConfigEventType): boolean {
    return this.getListenerCount(type) > 0;
  }
}

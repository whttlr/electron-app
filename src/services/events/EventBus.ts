import { 
  EventType, 
  Event, 
  EventListener, 
  EventSubscription, 
  EventBusConfig,
  EventData 
} from './EventTypes';
import { logger } from '../logger';

export class EventBus {
  private listeners: Map<EventType, Set<EventListener>> = new Map();
  private config: EventBusConfig;
  private metrics: Map<EventType, number> = new Map();

  constructor(config: Partial<EventBusConfig> = {}) {
    this.config = {
      maxListeners: 100,
      enableLogging: false,
      enableMetrics: true,
      ...config
    };
  }

  // Event Publishing
  emit<T = EventData>(type: EventType, data?: T, source?: string): void {
    const event: Event<T> = {
      type,
      data,
      timestamp: new Date(),
      source
    };

    if (this.config.enableLogging) {
      logger.debug(`Event emitted: ${type}`, { event });
    }

    if (this.config.enableMetrics) {
      this.incrementMetric(type);
    }

    const listeners = this.listeners.get(type);
    if (!listeners || listeners.size === 0) {
      return;
    }

    // Execute listeners asynchronously to prevent blocking
    setTimeout(() => {
      listeners.forEach(listener => {
        try {
          const result = listener(event);
          // Handle async listeners
          if (result instanceof Promise) {
            result.catch(error => {
              logger.error(`Event listener error for ${type}`, { error, event });
            });
          }
        } catch (error) {
          logger.error(`Event listener error for ${type}`, { error, event });
        }
      });
    }, 0);
  }

  // Event Subscription
  on<T = EventData>(type: EventType, listener: EventListener<T>): EventSubscription {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    const listeners = this.listeners.get(type)!;

    if (listeners.size >= this.config.maxListeners) {
      logger.warn(`Max listeners (${this.config.maxListeners}) reached for event: ${type}`);
    }

    listeners.add(listener as EventListener);

    if (this.config.enableLogging) {
      logger.debug(`Event listener added for: ${type}`);
    }

    return {
      unsubscribe: () => this.off(type, listener)
    };
  }

  // Event Unsubscription
  off<T = EventData>(type: EventType, listener: EventListener<T>): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(listener as EventListener);
      
      if (listeners.size === 0) {
        this.listeners.delete(type);
      }

      if (this.config.enableLogging) {
        logger.debug(`Event listener removed for: ${type}`);
      }
    }
  }

  // One-time Subscription
  once<T = EventData>(type: EventType, listener: EventListener<T>): EventSubscription {
    const onceListener: EventListener<T> = (event) => {
      listener(event);
      this.off(type, onceListener);
    };

    return this.on(type, onceListener);
  }

  // Multiple Event Subscription
  onAny(types: EventType[], listener: EventListener): EventSubscription[] {
    return types.map(type => this.on(type, listener));
  }

  // Wait for Event (Promise-based)
  waitFor<T = EventData>(
    type: EventType, 
    timeout?: number,
    condition?: (event: Event<T>) => boolean
  ): Promise<Event<T>> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined;
      
      const subscription = this.on<T>(type, (event) => {
        if (!condition || condition(event)) {
          if (timeoutId) clearTimeout(timeoutId);
          subscription.unsubscribe();
          resolve(event);
        }
      });

      if (timeout) {
        timeoutId = setTimeout(() => {
          subscription.unsubscribe();
          reject(new Error(`Timeout waiting for event: ${type}`));
        }, timeout);
      }
    });
  }

  // Event Stream (for debugging/monitoring)
  getEventStream(): AsyncIterableIterator<Event> {
    const events: Event[] = [];
    let resolve: ((value: IteratorResult<Event>) => void) | null = null;

    this.onAny(['*'], (event) => {
      if (resolve) {
        resolve({ value: event, done: false });
        resolve = null;
      } else {
        events.push(event);
      }
    });

    return {
      [Symbol.asyncIterator]() {
        return this;
      },
      async next(): Promise<IteratorResult<Event>> {
        if (events.length > 0) {
          return { value: events.shift()!, done: false };
        }

        return new Promise(res => {
          resolve = res;
        });
      }
    };
  }

  // Management
  removeAllListeners(type?: EventType): void {
    if (type) {
      this.listeners.delete(type);
      if (this.config.enableLogging) {
        logger.debug(`All listeners removed for: ${type}`);
      }
    } else {
      this.listeners.clear();
      if (this.config.enableLogging) {
        logger.debug('All event listeners removed');
      }
    }
  }

  getListenerCount(type: EventType): number {
    return this.listeners.get(type)?.size || 0;
  }

  getRegisteredEvents(): EventType[] {
    return Array.from(this.listeners.keys());
  }

  // Metrics
  private incrementMetric(type: EventType): void {
    const current = this.metrics.get(type) || 0;
    this.metrics.set(type, current + 1);
  }

  getMetrics(): Map<EventType, number> {
    return new Map(this.metrics);
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  // Configuration
  updateConfig(config: Partial<EventBusConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): EventBusConfig {
    return { ...this.config };
  }
}
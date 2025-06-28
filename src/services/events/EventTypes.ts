export type EventType = string;

export interface EventData {
  [key: string]: any;
}

export interface Event<T = EventData> {
  type: EventType;
  data?: T;
  timestamp: Date;
  source?: string;
}

export type EventListener<T = EventData> = (event: Event<T>) => void | Promise<void>;

export interface EventSubscription {
  unsubscribe(): void;
}

export interface EventBusConfig {
  maxListeners: number;
  enableLogging: boolean;
  enableMetrics: boolean;
}
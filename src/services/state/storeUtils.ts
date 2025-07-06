/**
 * Store Utilities
 *
 * Utility functions for Zustand stores including selectors,
 * subscriptions, and cross-store communication.
 */

import { useEffect, useRef, useState } from 'react';
import type { StoreApi } from 'zustand';

// ============================================================================
// SELECTOR UTILITIES
// ============================================================================

/**
 * Enhanced useStore hook with selector optimization
 */
export function useStoreWithSelector<T, U>(
  store: StoreApi<T>,
  selector: (state: T) => U,
  equalityFn?: (a: U, b: U) => boolean,
): U {
  const [state, setState] = useState(() => selector(store.getState()));
  const selectorRef = useRef(selector);
  const equalityFnRef = useRef(equalityFn);
  const stateRef = useRef(state);

  // Update refs
  selectorRef.current = selector;
  equalityFnRef.current = equalityFn;
  stateRef.current = state;

  useEffect(() => {
    const listener = () => {
      const newState = selectorRef.current(store.getState());
      const equalityFn = equalityFnRef.current;

      if (!equalityFn) {
        if (Object.is(newState, stateRef.current)) return;
      } else if (equalityFn(newState, stateRef.current)) return;

      setState(newState);
    };

    const unsubscribe = store.subscribe(listener);

    // Check if state has changed since initial render
    listener();

    return unsubscribe;
  }, [store]);

  return state;
}

/**
 * Create a subscription to store changes with cleanup
 */
export function createStoreSubscription<T>(
  store: StoreApi<T>,
  listener: (state: T, prevState: T) => void,
  selector?: (state: T) => any,
) {
  let prevSelected: any;

  const unsubscribe = store.subscribe((state, prevState) => {
    if (selector) {
      const selected = selector(state);
      if (Object.is(selected, prevSelected)) return;
      prevSelected = selected;
    }

    listener(state, prevState);
  });

  return unsubscribe;
}

/**
 * Debounced store subscription
 */
export function createDebouncedSubscription<T>(
  store: StoreApi<T>,
  listener: (state: T) => void,
  delay: number = 300,
) {
  let timeoutId: NodeJS.Timeout;

  const unsubscribe = store.subscribe((state) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => listener(state), delay);
  });

  return () => {
    clearTimeout(timeoutId);
    unsubscribe();
  };
}

/**
 * Throttled store subscription
 */
export function createThrottledSubscription<T>(
  store: StoreApi<T>,
  listener: (state: T) => void,
  interval: number = 100,
) {
  let lastCall = 0;

  const unsubscribe = store.subscribe((state) => {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      listener(state);
    }
  });

  return unsubscribe;
}

// ============================================================================
// DEEP EQUALITY UTILITIES
// ============================================================================

/**
 * Shallow equality comparison
 */
export function shallowEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;

  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }

  const keysA = Object.keys(a as any);
  const keysB = Object.keys(b as any);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!Object.is((a as any)[key], (b as any)[key])) return false;
  }

  return true;
}

/**
 * Deep equality comparison (limited depth for performance)
 */
export function deepEqual<T>(a: T, b: T, maxDepth: number = 3): boolean {
  if (maxDepth <= 0) return Object.is(a, b);
  if (Object.is(a, b)) return true;

  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const keysA = Object.keys(a as any);
  const keysB = Object.keys(b as any);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual((a as any)[key], (b as any)[key], maxDepth - 1)) return false;
  }

  return true;
}

// ============================================================================
// STORE COMPOSITION UTILITIES
// ============================================================================

/**
 * Combine multiple store selectors into one
 */
export function combineSelectors<T extends Record<string, any>>(
  selectors: T,
): <S>(state: S) => { [K in keyof T]: T[K] extends (state: S) => infer R ? R : never } {
  return (state) => {
    const result = {} as any;
    for (const [key, selector] of Object.entries(selectors)) {
      result[key] = selector(state);
    }
    return result;
  };
}

/**
 * Create a derived selector that depends on multiple stores
 */
export function createDerivedSelector<T1, T2, R>(
  store1: StoreApi<T1>,
  selector1: (state: T1) => any,
  store2: StoreApi<T2>,
  selector2: (state: T2) => any,
  combiner: (value1: any, value2: any) => R,
): () => R {
  return () => {
    const value1 = selector1(store1.getState());
    const value2 = selector2(store2.getState());
    return combiner(value1, value2);
  };
}

// ============================================================================
// PERSISTENCE UTILITIES
// ============================================================================

/**
 * Create a custom storage adapter
 */
export function createStorageAdapter(options: {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
}) {
  return {
    getItem: async (key: string) => {
      try {
        const result = await options.getItem(key);
        return result ? JSON.parse(result) : null;
      } catch (error) {
        console.error(`Error getting item ${key}:`, error);
        return null;
      }
    },
    setItem: async (key: string, value: any) => {
      try {
        await options.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting item ${key}:`, error);
      }
    },
    removeItem: async (key: string) => {
      try {
        await options.removeItem(key);
      } catch (error) {
        console.error(`Error removing item ${key}:`, error);
      }
    },
  };
}

/**
 * Create an encrypted storage adapter
 */
export function createEncryptedStorage(secretKey: string) {
  const encrypt = (text: string): string => {
    // Simple XOR encryption (use proper encryption in production)
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length),
      );
    }
    return btoa(result);
  };

  const decrypt = (encryptedText: string): string => {
    try {
      const text = atob(encryptedText);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length),
        );
      }
      return result;
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  };

  return createStorageAdapter({
    getItem: (key: string) => {
      const encrypted = localStorage.getItem(key);
      return encrypted ? decrypt(encrypted) : null;
    },
    setItem: (key: string, value: string) => {
      localStorage.setItem(key, encrypt(value));
    },
    removeItem: (key: string) => {
      localStorage.removeItem(key);
    },
  });
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Create a validator for store state
 */
export function createStateValidator<T>(
  schema: Record<string, (value: any) => string | null>,
) {
  return (state: T): Record<string, string[]> => {
    const errors: Record<string, string[]> = {};

    Object.entries(schema).forEach(([path, validator]) => {
      const value = getNestedValue(state, path);
      const error = validator(value);

      if (error) {
        const pathParts = path.split('.');
        const errorKey = pathParts.slice(0, -1).join('.') || 'root';

        if (!errors[errorKey]) {
          errors[errorKey] = [];
        }
        errors[errorKey].push(error);
      }
    });

    return errors;
  };
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Monitor store performance
 */
export function createStoreMonitor<T>(store: StoreApi<T>, name: string) {
  let updateCount = 0;
  let lastUpdate = Date.now();

  const unsubscribe = store.subscribe(() => {
    updateCount++;
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdate;

    if (timeSinceLastUpdate < 16) {
      console.warn(`Store ${name} updating too frequently: ${timeSinceLastUpdate}ms since last update`);
    }

    lastUpdate = now;

    // Log performance every 100 updates
    if (updateCount % 100 === 0) {
      console.log(`Store ${name} performance: ${updateCount} updates`);
    }
  });

  return {
    unsubscribe,
    getStats: () => ({ updateCount, lastUpdate }),
    reset: () => {
      updateCount = 0;
      lastUpdate = Date.now();
    },
  };
}

// ============================================================================
// CROSS-STORE COMMUNICATION
// ============================================================================

/**
 * Event bus for cross-store communication
 */
class StoreEventBus {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  subscribe(event: string, listener: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  emit(event: string, data?: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  clear(event?: string) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export const storeEventBus = new StoreEventBus();

// ============================================================================
// STORE DEBUGGING
// ============================================================================

/**
 * Debug helper for stores
 */
export function debugStore<T>(store: StoreApi<T>, name: string) {
  if (process.env.NODE_ENV !== 'development') return () => {};

  const unsubscribe = store.subscribe((state, prevState) => {
    console.group(`🏪 ${name} Store Update`);
    console.log('Previous State:', prevState);
    console.log('New State:', state);
    console.groupEnd();
  });

  return unsubscribe;
}

/**
 * Create a time-travel debugger for stores
 */
export function createTimeTravelDebugger<T>(store: StoreApi<T>) {
  const history: T[] = [];
  let currentIndex = -1;

  const unsubscribe = store.subscribe((state) => {
    // Remove any future states when a new state is added
    history.splice(currentIndex + 1);
    history.push(JSON.parse(JSON.stringify(state)));
    currentIndex = history.length - 1;
  });

  return {
    unsubscribe,
    undo: () => {
      if (currentIndex > 0) {
        currentIndex--;
        store.setState(history[currentIndex] as any);
      }
    },
    redo: () => {
      if (currentIndex < history.length - 1) {
        currentIndex++;
        store.setState(history[currentIndex] as any);
      }
    },
    canUndo: () => currentIndex > 0,
    canRedo: () => currentIndex < history.length - 1,
    getHistory: () => [...history],
    jumpTo: (index: number) => {
      if (index >= 0 && index < history.length) {
        currentIndex = index;
        store.setState(history[index] as any);
      }
    },
    clear: () => {
      history.length = 0;
      currentIndex = -1;
    },
  };
}

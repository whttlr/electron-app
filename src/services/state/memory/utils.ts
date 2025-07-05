/**
 * Memory Utilities
 * Helper functions for memory optimization and management
 */

/**
 * Debounce with memory cleanup
 */
export function memoryAwareDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  
  const debounced = ((...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null; // Clear reference
    }, delay);
  }) as T & { cancel: () => void };
  
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return debounced;
}

/**
 * Memoize with size limit
 */
export function boundedMemoize<T extends (...args: any[]) => any>(
  fn: T,
  maxSize: number = 100
): T {
  const cache = new Map<string, any>();
  
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  }) as T;
}

/**
 * Clean up large strings
 */
export function truncateLargeStrings(obj: any, maxLength: number = 1000): any {
  if (typeof obj === 'string') {
    return obj.length > maxLength ? obj.substring(0, maxLength) + '...' : obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => truncateLargeStrings(item, maxLength));
  }
  
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = truncateLargeStrings(value, maxLength);
    }
    return result;
  }
  
  return obj;
}
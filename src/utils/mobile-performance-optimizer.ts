/**
 * Mobile Performance Optimizer
 *
 * Specialized performance optimization utilities for mobile CNC control interfaces.
 * Focuses on touch responsiveness, battery efficiency, and smooth animations
 * in industrial tablet environments.
 */

import React, {
  useEffect, useRef, useCallback, useMemo,
} from 'react';
import { performanceMonitor } from './performance-monitor';

// Optimization strategies
export interface OptimizationConfig {
  enableVirtualization: boolean;
  enableMemoization: boolean;
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableTouchOptimization: boolean;
  enableBatteryOptimization: boolean;
  maxConcurrentAnimations: number;
  debounceDelay: number;
  throttleDelay: number;
}

export const defaultOptimizationConfig: OptimizationConfig = {
  enableVirtualization: true,
  enableMemoization: true,
  enableLazyLoading: true,
  enableImageOptimization: true,
  enableTouchOptimization: true,
  enableBatteryOptimization: true,
  maxConcurrentAnimations: 3,
  debounceDelay: 300,
  throttleDelay: 16, // ~60fps
};

// Performance-optimized touch handler
export const createOptimizedTouchHandler = (
  handler: (event: TouchEvent) => void,
  options: {
    passive?: boolean;
    debounce?: number;
    throttle?: number;
    enableHaptic?: boolean;
  } = {},
) => {
  const {
    passive = true,
    debounce = 0,
    throttle = 0,
    enableHaptic = false,
  } = options;

  let lastCall = 0;
  let timeoutId: NodeJS.Timeout;

  const optimizedHandler = (event: TouchEvent) => {
    const startTime = performance.now();

    if (enableHaptic && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }

    const execute = () => {
      try {
        handler(event);
      } finally {
        const endTime = performance.now();
        performanceMonitor.measureTouchLatency(startTime);
      }
    };

    if (debounce > 0) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(execute, debounce);
    } else if (throttle > 0) {
      const now = Date.now();
      if (now - lastCall >= throttle) {
        lastCall = now;
        execute();
      }
    } else {
      execute();
    }
  };

  return {
    handler: optimizedHandler,
    cleanup: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
    options: { passive },
  };
};

// Memory-efficient list virtualization
export class VirtualizedList<T> {
  private items: T[];

  private containerHeight: number;

  private itemHeight: number;

  private overscan: number;

  private scrollTop: number = 0;

  constructor(
    items: T[],
    containerHeight: number,
    itemHeight: number,
    overscan: number = 5,
  ) {
    this.items = items;
    this.containerHeight = containerHeight;
    this.itemHeight = itemHeight;
    this.overscan = overscan;
  }

  getVisibleRange(): { start: number; end: number; total: number } {
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
    const start = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.overscan);
    const end = Math.min(
      this.items.length - 1,
      start + visibleCount + this.overscan * 2,
    );

    return { start, end, total: this.items.length };
  }

  getVisibleItems(): { items: T[]; startIndex: number } {
    const { start, end } = this.getVisibleRange();
    return {
      items: this.items.slice(start, end + 1),
      startIndex: start,
    };
  }

  updateScrollTop(scrollTop: number): void {
    this.scrollTop = scrollTop;
  }

  getTotalHeight(): number {
    return this.items.length * this.itemHeight;
  }

  getOffsetTop(index: number): number {
    return index * this.itemHeight;
  }
}

// Battery-aware animation manager
export class BatteryAwareAnimationManager {
  private activeAnimations = new Set<string>();

  private maxConcurrentAnimations: number;

  private batteryLevel: number = 1;

  private powerSaveMode: boolean = false;

  constructor(maxConcurrentAnimations: number = 3) {
    this.maxConcurrentAnimations = maxConcurrentAnimations;
    this.setupBatteryMonitoring();
  }

  private async setupBatteryMonitoring(): Promise<void> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        this.batteryLevel = battery.level;
        this.powerSaveMode = battery.level < 0.2; // Enable power save below 20%

        battery.addEventListener('levelchange', () => {
          this.batteryLevel = battery.level;
          this.powerSaveMode = battery.level < 0.2;

          if (this.powerSaveMode) {
            this.reduceAnimations();
          }
        });
      } catch (error) {
        console.warn('Battery API not available:', error);
      }
    }
  }

  canStartAnimation(animationId: string): boolean {
    if (this.powerSaveMode) {
      return false; // Disable animations in power save mode
    }

    if (this.activeAnimations.has(animationId)) {
      return true; // Already running
    }

    return this.activeAnimations.size < this.maxConcurrentAnimations;
  }

  startAnimation(animationId: string): boolean {
    if (!this.canStartAnimation(animationId)) {
      return false;
    }

    this.activeAnimations.add(animationId);
    return true;
  }

  endAnimation(animationId: string): void {
    this.activeAnimations.delete(animationId);
  }

  private reduceAnimations(): void {
    // Cancel non-essential animations when battery is low
    const nonEssentialAnimations = Array.from(this.activeAnimations).filter(
      (id) => !id.startsWith('critical-') && !id.startsWith('emergency-'),
    );

    nonEssentialAnimations.forEach((id) => {
      this.endAnimation(id);
    });
  }

  getStatus(): {
    activeCount: number;
    maxCount: number;
    batteryLevel: number;
    powerSaveMode: boolean;
    } {
    return {
      activeCount: this.activeAnimations.size,
      maxCount: this.maxConcurrentAnimations,
      batteryLevel: this.batteryLevel,
      powerSaveMode: this.powerSaveMode,
    };
  }
}

// Image optimization utilities
export class ImageOptimizer {
  private static cache = new Map<string, string>();

  static async optimizeImage(
    imageSrc: string,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.8,
  ): Promise<string> {
    const cacheKey = `${imageSrc}-${maxWidth}-${maxHeight}-${quality}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Calculate optimal dimensions
        const { width, height } = this.calculateOptimalDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight,
        );

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);

        this.cache.set(cacheKey, optimizedDataUrl);
        resolve(optimizedDataUrl);
      };

      img.onerror = reject;
      img.src = imageSrc;
    });
  }

  private static calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
  ): { width: number; height: number } {
    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;
    const ratio = Math.min(widthRatio, heightRatio, 1); // Don't upscale

    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio),
    };
  }

  static preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

// React hooks for performance optimization
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  options: {
    debounce?: number;
    throttle?: number;
  } = {},
): T => {
  const { debounce = 0, throttle = 0 } = options;
  const lastCall = useRef(0);
  const timeoutId = useRef<NodeJS.Timeout>();

  const optimizedCallback = useCallback(
    (...args: Parameters<T>) => {
      const execute = () => callback(...args);

      if (debounce > 0) {
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }
        timeoutId.current = setTimeout(execute, debounce);
      } else if (throttle > 0) {
        const now = Date.now();
        if (now - lastCall.current >= throttle) {
          lastCall.current = now;
          execute();
        }
      } else {
        execute();
      }
    },
    [callback, debounce, throttle, ...deps],
  ) as T;

  useEffect(() => () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
  }, []);

  return optimizedCallback;
};

export const useVirtualizedList = <T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  overscan: number = 5,
) => {
  const virtualizer = useMemo(
    () => new VirtualizedList(items, containerHeight, itemHeight, overscan),
    [items, containerHeight, itemHeight, overscan],
  );

  const [scrollTop, setScrollTop] = React.useState(0);

  const handleScroll = useOptimizedCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      virtualizer.updateScrollTop(newScrollTop);
    },
    [virtualizer],
    { throttle: 16 }, // 60fps
  );

  const visibleItems = useMemo(() => {
    virtualizer.updateScrollTop(scrollTop);
    return virtualizer.getVisibleItems();
  }, [virtualizer, scrollTop]);

  return {
    visibleItems: visibleItems.items,
    startIndex: visibleItems.startIndex,
    totalHeight: virtualizer.getTotalHeight(),
    getOffsetTop: (index: number) => virtualizer.getOffsetTop(index),
    handleScroll,
  };
};

export const useBatteryAwareAnimation = (
  animationId: string,
  animationManager?: BatteryAwareAnimationManager,
) => {
  const manager = useMemo(
    () => animationManager || new BatteryAwareAnimationManager(),
    [animationManager],
  );

  const [canAnimate, setCanAnimate] = React.useState(
    manager.canStartAnimation(animationId),
  );

  const startAnimation = useCallback(() => {
    const started = manager.startAnimation(animationId);
    setCanAnimate(started);
    return started;
  }, [manager, animationId]);

  const endAnimation = useCallback(() => {
    manager.endAnimation(animationId);
    setCanAnimate(manager.canStartAnimation(animationId));
  }, [manager, animationId]);

  useEffect(() => () => {
    manager.endAnimation(animationId);
  }, [manager, animationId]);

  return {
    canAnimate,
    startAnimation,
    endAnimation,
    status: manager.getStatus(),
  };
};

export const useImageOptimization = (
  src: string,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8,
) => {
  const [optimizedSrc, setOptimizedSrc] = React.useState<string>(src);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    ImageOptimizer.optimizeImage(src, maxWidth, maxHeight, quality)
      .then((optimized) => {
        if (isMounted) {
          setOptimizedSrc(optimized);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setOptimizedSrc(src); // Fallback to original
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src, maxWidth, maxHeight, quality]);

  return { optimizedSrc, isLoading, error };
};

// Performance monitoring hook
export const usePerformanceOptimization = (config: Partial<OptimizationConfig> = {}) => {
  const fullConfig = useMemo(
    () => ({ ...defaultOptimizationConfig, ...config }),
    [config],
  );

  const [performanceData, setPerformanceData] = React.useState({
    frameRate: 0,
    memoryUsage: 0,
    batteryLevel: 1,
    powerSaveMode: false,
  });

  useEffect(() => {
    performanceMonitor.start();

    const unsubscribe = performanceMonitor.onAlert((alert) => {
      console.warn('Performance Alert:', alert.message, alert.suggestions);
    });

    const interval = setInterval(() => {
      const metrics = performanceMonitor.getLatestMetrics();
      if (metrics) {
        setPerformanceData({
          frameRate: metrics.frameRate,
          memoryUsage: metrics.memoryUsage.percentage,
          batteryLevel: 1, // Will be updated by battery API
          powerSaveMode: metrics.memoryUsage.percentage > 80,
        });
      }
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
      performanceMonitor.stop();
    };
  }, []);

  return {
    config: fullConfig,
    performanceData,
    optimizationSuggestions: generateOptimizationSuggestions(performanceData),
  };
};

// Generate optimization suggestions based on performance data
const generateOptimizationSuggestions = (performanceData: {
  frameRate: number;
  memoryUsage: number;
  batteryLevel: number;
  powerSaveMode: boolean;
}): string[] => {
  const suggestions: string[] = [];

  if (performanceData.frameRate < 30) {
    suggestions.push('Consider reducing visual effects to improve frame rate');
    suggestions.push('Use CSS transforms instead of changing layout properties');
  }

  if (performanceData.memoryUsage > 70) {
    suggestions.push('High memory usage detected - consider clearing old data');
    suggestions.push('Implement virtualization for large lists');
  }

  if (performanceData.powerSaveMode) {
    suggestions.push('Device in power save mode - animations disabled');
    suggestions.push('Consider reducing polling frequency');
  }

  if (performanceData.batteryLevel < 0.2) {
    suggestions.push('Low battery - consider enabling battery optimization');
    suggestions.push('Reduce screen brightness and disable non-essential features');
  }

  return suggestions;
};

// Export singleton instances
export const animationManager = new BatteryAwareAnimationManager();

export default {
  createOptimizedTouchHandler,
  VirtualizedList,
  BatteryAwareAnimationManager,
  ImageOptimizer,
  useOptimizedCallback,
  useVirtualizedList,
  useBatteryAwareAnimation,
  useImageOptimization,
  usePerformanceOptimization,
  animationManager,
};

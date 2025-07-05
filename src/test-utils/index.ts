/**
 * Component Testing Utilities and Helpers
 * 
 * Comprehensive testing utilities for React components,
 * store integration, and UI testing scenarios.
 */

import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from '../ui/shared/errorBoundary';
import { useMachineStore } from '../stores/machineStore';
import { useJobStore } from '../stores/jobStore';
import { useUIStore } from '../stores/uiStore';
import { useSettingsStore } from '../stores/settingsStore';
import { usePerformanceStore } from '../stores/performanceStore';
import type { Position3D, JobRecord, AppSettings } from '../stores/types';

// ============================================================================
// TEST PROVIDERS
// ============================================================================

interface TestProvidersProps {
  children: React.ReactNode;
  initialRoute?: string;
  theme?: 'light' | 'dark';
  withErrorBoundary?: boolean;
  withAnimation?: boolean;
}

const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  initialRoute = '/',
  theme = 'dark',
  withErrorBoundary = true,
  withAnimation = false,
}) => {
  const providers = (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? undefined : undefined, // Can be extended
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <MemoryRouter initialEntries={[initialRoute]}>
        {withAnimation ? (
          <AnimatePresence>{children}</AnimatePresence>
        ) : (
          children
        )}
      </MemoryRouter>
    </ConfigProvider>
  );
  
  if (withErrorBoundary) {
    return <ErrorBoundary isolate>{providers}</ErrorBoundary>;
  }
  
  return providers;
};

// ============================================================================
// CUSTOM RENDER FUNCTION
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  theme?: 'light' | 'dark';
  withErrorBoundary?: boolean;
  withAnimation?: boolean;
  preloadStores?: boolean;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderResult {
  const {
    initialRoute = '/',
    theme = 'dark',
    withErrorBoundary = true,
    withAnimation = false,
    preloadStores = true,
    ...renderOptions
  } = options;
  
  // Preload stores with sensible defaults
  if (preloadStores) {
    // Reset stores before each test
    useMachineStore.getState().reset();
    useJobStore.getState().reset();
    useUIStore.getState().reset();
    useSettingsStore.getState().reset();
    usePerformanceStore.getState().reset();
  }
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestProviders
      initialRoute={initialRoute}
      theme={theme}
      withErrorBoundary={withErrorBoundary}
      withAnimation={withAnimation}
    >
      {children}
    </TestProviders>
  );
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// ============================================================================
// STORE TEST HELPERS
// ============================================================================

export const storeHelpers = {
  // Machine Store Helpers
  machine: {
    setConnected: (connected: boolean = true) => {
      const store = useMachineStore.getState();
      store.setConnection({ isConnected: connected });
      store.updateStatus(connected ? 'idle' : 'disconnected');
    },
    
    setPosition: (position: Position3D) => {
      useMachineStore.getState().updatePosition(position);
    },
    
    addError: (message: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'high') => {
      useMachineStore.getState().addError({
        type: 'machine',
        severity,
        message,
      });
    },
    
    setStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'idle' | 'running' | 'paused' | 'error' | 'emergency' | 'homing') => {
      useMachineStore.getState().updateStatus(status);
    },
  },
  
  // Job Store Helpers
  job: {
    addTestJob: (name: string = 'Test Job'): string => {
      return useJobStore.getState().addJob({
        name,
        gcodeFile: `${name.toLowerCase().replace(' ', '_')}.gcode`,
        material: {
          type: 'Wood',
          thickness: 10,
          dimensions: { width: 100, height: 100 },
        },
        toolSettings: {
          toolNumber: 1,
          spindleSpeed: 1000,
          feedRate: 500,
          plungeRate: 100,
        },
        workOrigin: { x: 0, y: 0, z: 0 },
        totalLines: 100,
        currentLine: 0,
        estimatedDuration: 60,
      });
    },
    
    startJob: (jobId: string) => {
      const store = useJobStore.getState();
      store.updateJob(jobId, { status: 'running', startTime: new Date() });
      const job = store.queue.jobs.find(j => j.id === jobId);
      if (job) {
        store.currentJob = job;
        store.queue.currentJobId = jobId;
        store.queue.isProcessing = true;
      }
    },
    
    setProgress: (jobId: string, progress: number) => {
      useJobStore.getState().updateJobProgress(jobId, progress, Math.floor(progress));
    },
    
    completeJob: (jobId: string) => {
      useJobStore.getState().completeJob(jobId);
    },
  },
  
  // UI Store Helpers
  ui: {
    openModal: (modalId: string, data: any = {}) => {
      useUIStore.getState().openModal(modalId, data);
    },
    
    showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
      return useUIStore.getState().showToast(type, title, message, 0);
    },
    
    setLoading: (key: string, loading: boolean = true) => {
      useUIStore.getState().setLoading(key, loading);
    },
    
    setTheme: (theme: 'light' | 'dark') => {
      useUIStore.getState().setTheme(theme);
    },
    
    setMobile: (isMobile: boolean = true) => {
      useUIStore.getState().updateViewport({
        width: isMobile ? 600 : 1200,
        height: isMobile ? 800 : 900,
      });
    },
  },
  
  // Settings Store Helpers
  settings: {
    setMachineSettings: (settings: Partial<AppSettings['machine']>) => {
      useSettingsStore.getState().updateMachineSettings(settings);
    },
    
    setUISettings: (settings: Partial<AppSettings['ui']>) => {
      useSettingsStore.getState().updateUISettings(settings);
    },
    
    setValidationError: (path: string, error: string) => {
      const store = useSettingsStore.getState();
      store.validationErrors[path] = [error];
    },
  },
  
  // Performance Store Helpers
  performance: {
    setMetrics: (metrics: Partial<any>) => {
      usePerformanceStore.getState().updateMetrics(metrics);
    },
    
    addAlert: (type: string, severity: 'low' | 'medium' | 'high' | 'critical', message: string) => {
      usePerformanceStore.getState().addAlert({ type, severity, message });
    },
    
    startMonitoring: () => {
      usePerformanceStore.getState().startMonitoring();
    },
  },
};

// ============================================================================
// COMPONENT TEST HELPERS
// ============================================================================

export const componentHelpers = {
  // Wait for animations to complete
  waitForAnimation: (duration: number = 500) => {
    return new Promise(resolve => setTimeout(resolve, duration));
  },
  
  // Wait for async operations
  waitForAsync: async (fn: () => Promise<any>, timeout: number = 5000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        await fn();
        return;
      } catch (e) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    throw new Error(`Async operation timed out after ${timeout}ms`);
  },
  
  // Simulate user interactions
  simulateTyping: async (element: HTMLElement, text: string, delay: number = 50) => {
    const { fireEvent } = await import('@testing-library/react');
    
    for (let i = 0; i < text.length; i++) {
      const currentText = text.substring(0, i + 1);
      fireEvent.change(element, { target: { value: currentText } });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  },
  
  // Simulate drag and drop
  simulateDragDrop: async (source: HTMLElement, target: HTMLElement) => {
    const { fireEvent } = await import('@testing-library/react');
    
    fireEvent.dragStart(source);
    fireEvent.dragEnter(target);
    fireEvent.dragOver(target);
    fireEvent.drop(target);
    fireEvent.dragEnd(source);
  },
  
  // Simulate file upload
  simulateFileUpload: async (input: HTMLElement, file: File) => {
    const { fireEvent } = await import('@testing-library/react');
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
  },
};

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

export const mockData = {
  // Generate mock machine position
  position: (x: number = 0, y: number = 0, z: number = 0): Position3D => ({ x, y, z }),
  
  // Generate mock job
  job: (overrides: Partial<JobRecord> = {}): Omit<JobRecord, 'id' | 'progress' | 'status'> => ({
    name: 'Mock Job',
    description: 'A mock job for testing',
    gcodeFile: 'mock.gcode',
    material: {
      type: 'Wood',
      thickness: 10,
      dimensions: { width: 100, height: 100 },
    },
    toolSettings: {
      toolNumber: 1,
      spindleSpeed: 1000,
      feedRate: 500,
      plungeRate: 100,
    },
    workOrigin: { x: 0, y: 0, z: 0 },
    totalLines: 100,
    currentLine: 0,
    estimatedDuration: 60,
    errors: [],
    warnings: [],
    metadata: {},
    ...overrides,
  }),
  
  // Generate mock file
  file: (name: string = 'test.gcode', content: string = 'G0 X0 Y0 Z0', type: string = 'text/plain'): File => {
    return new File([content], name, { type });
  },
  
  // Generate mock image file
  imageFile: (name: string = 'test.png'): File => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    
    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(new File([blob!], name, { type: 'image/png' }));
      }, 'image/png');
    }) as any;
  },
  
  // Generate mock error
  error: (message: string = 'Mock error', type: string = 'machine', severity: 'low' | 'medium' | 'high' | 'critical' = 'high') => ({
    type,
    severity,
    message,
  }),
  
  // Generate mock performance metrics
  performanceMetrics: () => ({
    cpu: {
      usage: Math.floor(Math.random() * 100),
      history: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)),
    },
    memory: {
      used: Math.floor(Math.random() * 8192),
      total: 8192,
      history: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)),
    },
    network: {
      latency: Math.floor(Math.random() * 100) + 10,
      bandwidth: Math.floor(Math.random() * 100) + 50,
      packetsLost: Math.floor(Math.random() * 5),
    },
    rendering: {
      fps: Math.floor(Math.random() * 60) + 30,
      frameTime: Math.random() * 33 + 16,
      droppedFrames: Math.floor(Math.random() * 10),
    },
    machine: {
      commandQueue: Math.floor(Math.random() * 100),
      responseTime: Math.floor(Math.random() * 50) + 5,
      errorRate: Math.random() * 5,
    },
  }),
};

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

export const assertions = {
  // Assert store state
  expectStoreState: (storeName: 'machine' | 'job' | 'ui' | 'settings' | 'performance', expectedState: any) => {
    const stores = {
      machine: useMachineStore.getState(),
      job: useJobStore.getState(),
      ui: useUIStore.getState(),
      settings: useSettingsStore.getState(),
      performance: usePerformanceStore.getState(),
    };
    
    const actualState = stores[storeName];
    expect(actualState).toMatchObject(expectedState);
  },
  
  // Assert element has specific classes
  expectElementClasses: (element: HTMLElement, classes: string[]) => {
    classes.forEach(className => {
      expect(element).toHaveClass(className);
    });
  },
  
  // Assert element has specific attributes
  expectElementAttributes: (element: HTMLElement, attributes: Record<string, string>) => {
    Object.entries(attributes).forEach(([attr, value]) => {
      expect(element).toHaveAttribute(attr, value);
    });
  },
  
  // Assert async state changes
  expectEventuallyToHave: async (fn: () => any, expected: any, timeout: number = 5000) => {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      try {
        const actual = fn();
        expect(actual).toEqual(expected);
        return;
      } catch (e) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    throw new Error(`Expected state not reached within ${timeout}ms`);
  },
};

// ============================================================================
// PERFORMANCE TESTING HELPERS
// ============================================================================

export const performanceHelpers = {
  // Measure render time
  measureRenderTime: async (renderFn: () => RenderResult): Promise<{ result: RenderResult; duration: number }> => {
    const start = performance.now();
    const result = renderFn();
    const end = performance.now();
    
    return {
      result,
      duration: end - start,
    };
  },
  
  // Measure memory usage
  measureMemoryUsage: <T>(fn: () => T): { result: T; memoryUsed: number } => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const result = fn();
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    return {
      result,
      memoryUsed: finalMemory - initialMemory,
    };
  },
  
  // Stress test with rapid operations
  stressTest: async (operation: () => void, iterations: number = 1000, maxDuration: number = 5000) => {
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      operation();
      
      // Check timeout
      if (performance.now() - start > maxDuration) {
        throw new Error(`Stress test exceeded ${maxDuration}ms with ${i} iterations`);
      }
    }
    
    return {
      duration: performance.now() - start,
      iterationsCompleted: iterations,
    };
  },
};

// ============================================================================
// ACCESSIBILITY HELPERS
// ============================================================================

export const a11yHelpers = {
  // Check for accessibility violations
  checkA11y: async (container: HTMLElement) => {
    const { axe } = await import('axe-core');
    const results = await axe.run(container);
    
    if (results.violations.length > 0) {
      const violations = results.violations.map(v => `${v.id}: ${v.description}`);
      throw new Error(`Accessibility violations found:\n${violations.join('\n')}`);
    }
    
    return results;
  },
  
  // Simulate screen reader
  simulateScreenReader: (element: HTMLElement): string[] => {
    const texts: string[] = [];
    
    // Get aria-label or aria-labelledby
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) texts.push(ariaLabel);
    
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) texts.push(labelElement.textContent || '');
    }
    
    // Get text content
    if (element.textContent) texts.push(element.textContent);
    
    // Get alt text for images
    if (element.tagName === 'IMG') {
      const alt = element.getAttribute('alt');
      if (alt) texts.push(`Image: ${alt}`);
    }
    
    return texts.filter(Boolean);
  },
  
  // Check keyboard navigation
  checkKeyboardNavigation: async (container: HTMLElement): Promise<HTMLElement[]> => {
    const { fireEvent } = await import('@testing-library/react');
    const focusableElements: HTMLElement[] = [];
    
    const focusableSelectors = [
      'button:not(:disabled)',
      'input:not(:disabled)',
      'select:not(:disabled)',
      'textarea:not(:disabled)',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');
    
    const elements = container.querySelectorAll(focusableSelectors);
    
    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.focus();
        if (document.activeElement === element) {
          focusableElements.push(element);
        }
      }
    });
    
    return focusableElements;
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  renderWithProviders,
  storeHelpers,
  componentHelpers,
  mockData,
  assertions,
  performanceHelpers,
  a11yHelpers,
};

// Re-export everything from testing library for convenience
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

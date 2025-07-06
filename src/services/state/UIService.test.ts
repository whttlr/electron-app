/**
 * UI Store Unit Tests
 *
 * Comprehensive tests for UI state management,
 * modal control, and responsive behavior.
 */

import { renderHook, act } from '@testing-library/react';
import { useUIStore, uiSelectors } from '../uiStore';

// Mock DOM methods
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

// Mock document methods
Object.defineProperty(document, 'documentElement', {
  value: {
    setAttribute: jest.fn(),
  },
  writable: true,
});

const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

describe('UIStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useUIStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useUIStore());
      const state = result.current;

      expect(state.ui.theme).toBe('dark');
      expect(state.ui.sidebarCollapsed).toBe(false);
      expect(state.ui.activeView).toBe('dashboard');
      expect(state.modals).toEqual({});
      expect(state.drawers).toEqual({});
      expect(state.loading).toEqual({});
      expect(state.toasts).toEqual([]);
    });
  });

  describe('Theme Management', () => {
    it('should set theme', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.ui.theme).toBe('light');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('should handle auto theme', () => {
      // Mock matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setTheme('auto');
      });

      expect(result.current.ui.theme).toBe('auto');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });
  });

  describe('Sidebar Management', () => {
    it('should toggle sidebar', () => {
      const { result } = renderHook(() => useUIStore());

      expect(result.current.ui.sidebarCollapsed).toBe(false);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.ui.sidebarCollapsed).toBe(true);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.ui.sidebarCollapsed).toBe(false);
    });

    it('should set sidebar collapsed state', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setSidebarCollapsed(true);
      });

      expect(result.current.ui.sidebarCollapsed).toBe(true);
    });
  });

  describe('View Management', () => {
    it('should set active view', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setActiveView('controls');
      });

      expect(result.current.ui.activeView).toBe('controls');
    });
  });

  describe('Viewport Management', () => {
    it('should update viewport dimensions', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.updateViewport({
          width: 800,
          height: 600,
        });
      });

      expect(result.current.ui.viewport.width).toBe(800);
      expect(result.current.ui.viewport.height).toBe(600);
      expect(result.current.ui.viewport.isMobile).toBe(false);
      expect(result.current.ui.viewport.isTablet).toBe(false);
    });

    it('should detect mobile viewport', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.updateViewport({
          width: 600,
          height: 800,
        });
      });

      expect(result.current.ui.viewport.isMobile).toBe(true);
      expect(result.current.ui.viewport.isTablet).toBe(false);
    });

    it('should detect tablet viewport', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.updateViewport({
          width: 900,
          height: 600,
        });
      });

      expect(result.current.ui.viewport.isMobile).toBe(false);
      expect(result.current.ui.viewport.isTablet).toBe(true);
    });

    it('should auto-collapse sidebar on mobile', () => {
      const { result } = renderHook(() => useUIStore());

      // Start with expanded sidebar
      act(() => {
        result.current.setSidebarCollapsed(false);
      });

      // Switch to mobile viewport
      act(() => {
        result.current.updateViewport({
          width: 600,
          height: 800,
        });
      });

      expect(result.current.ui.sidebarCollapsed).toBe(true);
    });
  });

  describe('Modal Management', () => {
    it('should open modal', () => {
      const { result } = renderHook(() => useUIStore());
      const modalData = { title: 'Test Modal', content: 'Test content' };

      act(() => {
        result.current.openModal('test-modal', modalData, { width: 500 });
      });

      expect(result.current.modals['test-modal']).toBeDefined();
      expect(result.current.modals['test-modal'].isOpen).toBe(true);
      expect(result.current.modals['test-modal'].data).toEqual(modalData);
      expect(result.current.modals['test-modal'].options).toEqual({ width: 500 });
      expect(result.current.ui.modalStack).toContain('test-modal');
    });

    it('should close modal', () => {
      const { result } = renderHook(() => useUIStore());

      // Open modal first
      act(() => {
        result.current.openModal('test-modal', {});
      });

      expect(result.current.modals['test-modal'].isOpen).toBe(true);

      // Close modal
      act(() => {
        result.current.closeModal('test-modal');
      });

      expect(result.current.modals['test-modal'].isOpen).toBe(false);
      expect(result.current.ui.modalStack).not.toContain('test-modal');
    });

    it('should close all modals', () => {
      const { result } = renderHook(() => useUIStore());

      // Open multiple modals
      act(() => {
        result.current.openModal('modal-1', {});
        result.current.openModal('modal-2', {});
        result.current.openModal('modal-3', {});
      });

      expect(result.current.ui.modalStack).toHaveLength(3);

      // Close all modals
      act(() => {
        result.current.closeAllModals();
      });

      expect(result.current.ui.modalStack).toHaveLength(0);
      expect(result.current.modals['modal-1'].isOpen).toBe(false);
      expect(result.current.modals['modal-2'].isOpen).toBe(false);
      expect(result.current.modals['modal-3'].isOpen).toBe(false);
    });

    it('should check if modal is open', () => {
      const { result } = renderHook(() => useUIStore());

      expect(result.current.isModalOpen('test-modal')).toBe(false);

      act(() => {
        result.current.openModal('test-modal', {});
      });

      expect(result.current.isModalOpen('test-modal')).toBe(true);
    });

    it('should get modal data', () => {
      const { result } = renderHook(() => useUIStore());
      const modalData = { title: 'Test', value: 123 };

      act(() => {
        result.current.openModal('test-modal', modalData);
      });

      expect(result.current.getModalData('test-modal')).toEqual(modalData);
    });
  });

  describe('Drawer Management', () => {
    it('should open drawer', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openDrawer('test-drawer', { width: 400, placement: 'left' });
      });

      expect(result.current.drawers['test-drawer']).toBeDefined();
      expect(result.current.drawers['test-drawer'].isOpen).toBe(true);
      expect(result.current.drawers['test-drawer'].width).toBe(400);
      expect(result.current.drawers['test-drawer'].placement).toBe('left');
    });

    it('should close drawer', () => {
      const { result } = renderHook(() => useUIStore());

      // Open drawer first
      act(() => {
        result.current.openDrawer('test-drawer');
      });

      expect(result.current.drawers['test-drawer'].isOpen).toBe(true);

      // Close drawer
      act(() => {
        result.current.closeDrawer('test-drawer');
      });

      expect(result.current.drawers['test-drawer'].isOpen).toBe(false);
    });

    it('should toggle drawer', () => {
      const { result } = renderHook(() => useUIStore());

      // Toggle to open
      act(() => {
        result.current.toggleDrawer('test-drawer');
      });

      expect(result.current.drawers['test-drawer'].isOpen).toBe(true);

      // Toggle to close
      act(() => {
        result.current.toggleDrawer('test-drawer');
      });

      expect(result.current.drawers['test-drawer'].isOpen).toBe(false);
    });

    it('should check if drawer is open', () => {
      const { result } = renderHook(() => useUIStore());

      expect(result.current.isDrawerOpen('test-drawer')).toBe(false);

      act(() => {
        result.current.openDrawer('test-drawer');
      });

      expect(result.current.isDrawerOpen('test-drawer')).toBe(true);
    });
  });

  describe('Loading State Management', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setLoading('api-call', true);
      });

      expect(result.current.loading['api-call']).toBe(true);
      expect(result.current.isLoading('api-call')).toBe(true);
    });

    it('should clear loading state', () => {
      const { result } = renderHook(() => useUIStore());

      // Set loading first
      act(() => {
        result.current.setLoading('api-call', true);
      });

      expect(result.current.isLoading('api-call')).toBe(true);

      // Clear loading
      act(() => {
        result.current.setLoading('api-call', false);
      });

      expect(result.current.isLoading('api-call')).toBe(false);
      expect(result.current.loading['api-call']).toBeUndefined();
    });
  });

  describe('Toast Management', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should show toast', () => {
      const { result } = renderHook(() => useUIStore());

      let toastId: string;
      act(() => {
        toastId = result.current.showToast('success', 'Test Title', 'Test message', 5000);
      });

      expect(toastId!).toBeDefined();
      expect(result.current.toasts).toHaveLength(1);

      const toast = result.current.toasts[0];
      expect(toast.type).toBe('success');
      expect(toast.title).toBe('Test Title');
      expect(toast.message).toBe('Test message');
      expect(toast.duration).toBe(5000);
    });

    it('should auto-hide toast after duration', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.showToast('info', 'Auto Hide', 'This will disappear', 1000);
      });

      expect(result.current.toasts).toHaveLength(1);

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should hide toast by ID', () => {
      const { result } = renderHook(() => useUIStore());

      let toastId: string;
      act(() => {
        toastId = result.current.showToast('warning', 'Manual Hide', undefined, 0);
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.hideToast(toastId!);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should clear all toasts', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.showToast('success', 'Toast 1', undefined, 0);
        result.current.showToast('error', 'Toast 2', undefined, 0);
        result.current.showToast('info', 'Toast 3', undefined, 0);
      });

      expect(result.current.toasts).toHaveLength(3);

      act(() => {
        result.current.clearToasts();
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should limit number of toasts', () => {
      const { result } = renderHook(() => useUIStore());

      // Add 15 toasts (more than the 10 limit)
      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.showToast('info', `Toast ${i}`, undefined, 0);
        }
      });

      expect(result.current.toasts).toHaveLength(10);
      expect(result.current.toasts[0].title).toBe('Toast 5'); // First 5 should be removed
      expect(result.current.toasts[9].title).toBe('Toast 14');
    });
  });

  describe('Notification Settings', () => {
    it('should update notification settings', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.updateNotificationSettings({
          enabled: false,
          sound: false,
          position: 'bottom-left',
          duration: 3000,
        });
      });

      expect(result.current.ui.notificationSettings.enabled).toBe(false);
      expect(result.current.ui.notificationSettings.sound).toBe(false);
      expect(result.current.ui.notificationSettings.position).toBe('bottom-left');
      expect(result.current.ui.notificationSettings.duration).toBe(3000);
    });
  });

  describe('Tour Management', () => {
    it('should start tour', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.startTour();
      });

      expect(result.current.ui.tour.isActive).toBe(true);
      expect(result.current.ui.tour.currentStep).toBe(0);
    });

    it('should end tour', () => {
      const { result } = renderHook(() => useUIStore());

      // Start tour first
      act(() => {
        result.current.startTour();
      });

      expect(result.current.ui.tour.isActive).toBe(true);

      // End tour
      act(() => {
        result.current.endTour();
      });

      expect(result.current.ui.tour.isActive).toBe(false);
      expect(result.current.ui.tour.currentStep).toBe(0);
    });

    it('should set tour step', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setTourStep(3);
      });

      expect(result.current.ui.tour.currentStep).toBe(3);
    });

    it('should mark tour as completed', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.markTourCompleted('onboarding-tour');
      });

      expect(result.current.ui.tour.completed).toContain('onboarding-tour');
    });
  });

  describe('Selectors', () => {
    it('should select theme', () => {
      const { result } = renderHook(() => {
        const store = useUIStore();
        return uiSelectors.theme(store);
      });

      expect(result.current).toBe('dark');
    });

    it('should select sidebar collapsed state', () => {
      const { result } = renderHook(() => {
        const store = useUIStore();
        return uiSelectors.sidebarCollapsed(store);
      });

      expect(result.current).toBe(false);
    });

    it('should detect mobile viewport', () => {
      const { result } = renderHook(() => useUIStore());

      const isMobile = uiSelectors.isMobile(result.current);
      expect(isMobile).toBe(false); // Default viewport is 1024x768
    });

    it('should detect open modals', () => {
      const { result } = renderHook(() => useUIStore());

      expect(uiSelectors.hasOpenModals(result.current)).toBe(false);

      act(() => {
        result.current.openModal('test-modal', {});
      });

      expect(uiSelectors.hasOpenModals(result.current)).toBe(true);
    });

    it('should detect loading states', () => {
      const { result } = renderHook(() => useUIStore());

      expect(uiSelectors.hasAnyLoading(result.current)).toBe(false);

      act(() => {
        result.current.setLoading('test', true);
      });

      expect(uiSelectors.hasAnyLoading(result.current)).toBe(true);
    });
  });
});

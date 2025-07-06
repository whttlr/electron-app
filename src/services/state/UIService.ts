/**
 * UI State Store
 *
 * Zustand store for UI state management including theme, modals,
 * notifications, and responsive layout state.
 */

import create from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
// import { immer } from 'zustand/middleware';
import type {
  UIState,
  NotificationState,
  StoreActions,
} from './types';

// ============================================================================
// STORE STATE INTERFACE
// ============================================================================

export interface UIStore {
  // UI State
  ui: UIState;

  // Modal Management
  modals: {
    [modalId: string]: {
      isOpen: boolean;
      data?: any;
      options?: any;
    };
  };

  // Drawer/Sidebar State
  drawers: {
    [drawerId: string]: {
      isOpen: boolean;
      width?: number;
      placement?: 'left' | 'right' | 'top' | 'bottom';
    };
  };

  // Loading States
  loading: {
    [key: string]: boolean;
  };

  // Toast/Message Queue
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    timestamp: number;
  }>;

  // Actions
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveView: (view: string) => void;
  updateViewport: (viewport: Partial<UIState['viewport']>) => void;

  // Modal Actions
  openModal: (modalId: string, data?: any, options?: any) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
  isModalOpen: (modalId: string) => boolean;
  getModalData: (modalId: string) => any;

  // Drawer Actions
  openDrawer: (drawerId: string, options?: { width?: number; placement?: 'left' | 'right' | 'top' | 'bottom' }) => void;
  closeDrawer: (drawerId: string) => void;
  toggleDrawer: (drawerId: string) => void;
  isDrawerOpen: (drawerId: string) => boolean;

  // Loading Actions
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;

  // Toast Actions
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string, duration?: number) => string;
  hideToast: (toastId: string) => void;
  clearToasts: () => void;

  // Notification Actions
  updateNotificationSettings: (settings: Partial<NotificationState>) => void;

  // Tour Actions
  startTour: () => void;
  endTour: () => void;
  setTourStep: (step: number) => void;
  markTourCompleted: (tourId: string) => void;

  // Responsive Actions
  handleResize: () => void;

  reset: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialUIState: UIState = {
  theme: 'dark',
  sidebarCollapsed: false,
  activeView: 'dashboard',
  modalStack: [],
  notificationSettings: {
    enabled: true,
    sound: true,
    position: 'top-right',
    duration: 4000,
    maxCount: 5,
    types: {
      machine: true,
      job: true,
      safety: true,
      system: true,
    },
  },
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
  },
  tour: {
    isActive: false,
    currentStep: 0,
    completed: [],
  },
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useUIStore = create<UIStore>()((
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial State
        ui: initialUIState,
        modals: {},
        drawers: {},
        loading: {},
        toasts: [],

        // Theme Actions
        setTheme: (theme) => set((state) => {
          state.ui.theme = theme;

          // Apply theme to document
          if (typeof window !== 'undefined') {
            const root = document.documentElement;
            if (theme === 'auto') {
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            } else {
              root.setAttribute('data-theme', theme);
            }
          }
        }),

        toggleSidebar: () => set((state) => {
          state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed;
        }),

        setSidebarCollapsed: (collapsed) => set((state) => {
          state.ui.sidebarCollapsed = collapsed;
        }),

        setActiveView: (view) => set((state) => {
          state.ui.activeView = view;
        }),

        updateViewport: (viewport) => set((state) => {
          Object.assign(state.ui.viewport, viewport);

          // Update responsive flags
          const { width } = state.ui.viewport;
          state.ui.viewport.isMobile = width < 768;
          state.ui.viewport.isTablet = width >= 768 && width < 1024;

          // Auto-collapse sidebar on mobile
          if (state.ui.viewport.isMobile && !state.ui.sidebarCollapsed) {
            state.ui.sidebarCollapsed = true;
          }
        }),

        // Modal Actions
        openModal: (modalId, data, options) => set((state) => {
          state.modals[modalId] = {
            isOpen: true,
            data,
            options,
          };

          // Add to modal stack
          if (!state.ui.modalStack.includes(modalId)) {
            state.ui.modalStack.push(modalId);
          }
        }),

        closeModal: (modalId) => set((state) => {
          if (state.modals[modalId]) {
            state.modals[modalId].isOpen = false;
          }

          // Remove from modal stack
          const index = state.ui.modalStack.indexOf(modalId);
          if (index !== -1) {
            state.ui.modalStack.splice(index, 1);
          }
        }),

        closeAllModals: () => set((state) => {
          Object.keys(state.modals).forEach((modalId) => {
            state.modals[modalId].isOpen = false;
          });
          state.ui.modalStack = [];
        }),

        isModalOpen: (modalId) => {
          const state = get();
          return state.modals[modalId]?.isOpen || false;
        },

        getModalData: (modalId) => {
          const state = get();
          return state.modals[modalId]?.data;
        },

        // Drawer Actions
        openDrawer: (drawerId, options = {}) => set((state) => {
          state.drawers[drawerId] = {
            isOpen: true,
            width: options.width || 300,
            placement: options.placement || 'right',
          };
        }),

        closeDrawer: (drawerId) => set((state) => {
          if (state.drawers[drawerId]) {
            state.drawers[drawerId].isOpen = false;
          }
        }),

        toggleDrawer: (drawerId) => set((state) => {
          if (state.drawers[drawerId]) {
            state.drawers[drawerId].isOpen = !state.drawers[drawerId].isOpen;
          } else {
            state.drawers[drawerId] = {
              isOpen: true,
              width: 300,
              placement: 'right',
            };
          }
        }),

        isDrawerOpen: (drawerId) => {
          const state = get();
          return state.drawers[drawerId]?.isOpen || false;
        },

        // Loading Actions
        setLoading: (key, loading) => set((state) => {
          if (loading) {
            state.loading[key] = true;
          } else {
            delete state.loading[key];
          }
        }),

        isLoading: (key) => {
          const state = get();
          return state.loading[key] || false;
        },

        // Toast Actions
        showToast: (type, title, message, duration = 4000) => {
          const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          set((state) => {
            state.toasts.push({
              id: toastId,
              type,
              title,
              message,
              duration,
              timestamp: Date.now(),
            });

            // Keep only latest 10 toasts
            if (state.toasts.length > 10) {
              state.toasts = state.toasts.slice(-10);
            }
          });

          // Auto-remove toast after duration
          if (duration > 0) {
            setTimeout(() => {
              get().hideToast(toastId);
            }, duration);
          }

          return toastId;
        },

        hideToast: (toastId) => set((state) => {
          state.toasts = state.toasts.filter((toast) => toast.id !== toastId);
        }),

        clearToasts: () => set((state) => {
          state.toasts = [];
        }),

        // Notification Actions
        updateNotificationSettings: (settings) => set((state) => {
          Object.assign(state.ui.notificationSettings, settings);
        }),

        // Tour Actions
        startTour: () => set((state) => {
          state.ui.tour.isActive = true;
          state.ui.tour.currentStep = 0;
        }),

        endTour: () => set((state) => {
          state.ui.tour.isActive = false;
          state.ui.tour.currentStep = 0;
        }),

        setTourStep: (step) => set((state) => {
          state.ui.tour.currentStep = step;
        }),

        markTourCompleted: (tourId) => set((state) => {
          if (!state.ui.tour.completed.includes(tourId)) {
            state.ui.tour.completed.push(tourId);
          }
        }),

        // Responsive Actions
        handleResize: () => {
          if (typeof window !== 'undefined') {
            get().updateViewport({
              width: window.innerWidth,
              height: window.innerHeight,
            });
          }
        },

        reset: () => set((state) => {
          state.ui = initialUIState;
          state.modals = {};
          state.drawers = {};
          state.loading = {};
          state.toasts = [];
        }),
      }),
    ),
    {
      name: 'ui-store',
      storage: localStorage,
      partialize: (state) => ({
        ui: {
          theme: state.ui.theme,
          sidebarCollapsed: state.ui.sidebarCollapsed,
          activeView: state.ui.activeView,
          notificationSettings: state.ui.notificationSettings,
          tour: {
            completed: state.ui.tour.completed,
          },
        },
      }),
      version: 1,
    },
  )
));

// ============================================================================
// STORE SELECTORS
// ============================================================================

export const uiSelectors = {
  theme: (state: UIStore) => state.ui.theme,
  sidebarCollapsed: (state: UIStore) => state.ui.sidebarCollapsed,
  activeView: (state: UIStore) => state.ui.activeView,
  viewport: (state: UIStore) => state.ui.viewport,
  isMobile: (state: UIStore) => state.ui.viewport.isMobile,
  isTablet: (state: UIStore) => state.ui.viewport.isTablet,
  modalStack: (state: UIStore) => state.ui.modalStack,
  hasOpenModals: (state: UIStore) => state.ui.modalStack.length > 0,
  notifications: (state: UIStore) => state.ui.notificationSettings,
  tourState: (state: UIStore) => state.ui.tour,
  toasts: (state: UIStore) => state.toasts,
  hasToasts: (state: UIStore) => state.toasts.length > 0,
  loadingStates: (state: UIStore) => state.loading,
  hasAnyLoading: (state: UIStore) => Object.keys(state.loading).length > 0,
  modalState: (state: UIStore) => (modalId: string) => state.modals[modalId],
  drawerState: (state: UIStore) => (drawerId: string) => state.drawers[drawerId],
};

// ============================================================================
// THEME UTILITIES
// ============================================================================

export const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
};

// ============================================================================
// STORE SUBSCRIPTIONS
// ============================================================================

// Apply theme changes to DOM
useUIStore.subscribe(
  (state) => state.ui.theme,
  (theme) => {
    applyTheme(theme);
  },
);

// Auto-close modals on mobile when sidebar opens
useUIStore.subscribe(
  (state) => [state.ui.sidebarCollapsed, state.ui.viewport.isMobile],
  ([sidebarCollapsed, isMobile]) => {
    if (isMobile && !sidebarCollapsed) {
      // Close all modals when sidebar opens on mobile
      useUIStore.getState().closeAllModals();
    }
  },
);

// Handle window resize
if (typeof window !== 'undefined') {
  const handleResize = () => {
    useUIStore.getState().handleResize();
  };

  window.addEventListener('resize', handleResize);

  // Handle theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleThemeChange = (e: MediaQueryListEvent) => {
    const store = useUIStore.getState();
    if (store.ui.theme === 'auto') {
      applyTheme('auto');
    }
  };

  mediaQuery.addEventListener('change', handleThemeChange);
}

// Initialize theme on store creation
if (typeof window !== 'undefined') {
  const initialTheme = useUIStore.getState().ui.theme;
  applyTheme(initialTheme);
}

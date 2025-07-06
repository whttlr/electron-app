/**
 * Settings Store
 *
 * Zustand store for application and machine settings with persistence,
 * validation, and configuration management.
 */

import create from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
// import { immer } from 'zustand/middleware';
import type {
  AppSettings,
  MachineSettings,
  WorkingArea,
  Position3D,
  StoreActions,
} from './types';

// ============================================================================
// STORE STATE INTERFACE
// ============================================================================

export interface SettingsStore {
  // Settings State
  settings: AppSettings;

  // Configuration Status
  isLoaded: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;

  // Validation
  validationErrors: Record<string, string[]>;

  // Actions
  updateGeneralSettings: (settings: Partial<AppSettings['general']>) => void;
  updateMachineSettings: (settings: Partial<MachineSettings>) => void;
  updateUISettings: (settings: Partial<AppSettings['ui']>) => void;
  updatePerformanceSettings: (settings: Partial<AppSettings['performance']>) => void;
  updateSecuritySettings: (settings: Partial<AppSettings['security']>) => void;

  // Specific Machine Settings
  updateWorkingArea: (area: WorkingArea) => void;
  updateMovementSettings: (settings: Partial<MachineSettings['movement']>) => void;
  updateSafetySettings: (settings: Partial<MachineSettings['safety']>) => void;
  updateCalibrationSettings: (settings: Partial<MachineSettings['calibration']>) => void;
  updateConnectionSettings: (settings: Partial<MachineSettings['connection']>) => void;

  // Validation and Persistence
  validateSettings: () => boolean;
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => Promise<void>;

  // Utility Actions
  getSetting: <T = any>(path: string) => T | undefined;
  setSetting: (path: string, value: any) => void;
  getValidationErrors: (path?: string) => string[];
  clearValidationErrors: (path?: string) => void;

  reset: () => void;
}

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

const defaultSettings: AppSettings = {
  general: {
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    autoSave: true,
    autoBackup: true,
    checkUpdates: true,
  },
  machine: {
    workingArea: {
      width: 300,
      height: 300,
      depth: 100,
      units: 'mm',
    },
    connection: {
      type: 'serial',
      port: '/dev/ttyUSB0',
      baudRate: 115200,
    },
    movement: {
      maxFeedRate: 3000,
      defaultFeedRate: 1000,
      rapidSpeed: 5000,
      jogSpeed: 1000,
      jogStepSize: 1,
      homingRequired: true,
    },
    safety: {
      softLimits: true,
      hardLimits: true,
      emergencyStopEnabled: true,
      maxSpindleSpeed: 24000,
      temperatureLimit: 60,
    },
    calibration: {
      stepsPerMm: { x: 80, y: 80, z: 400 },
      backlash: { x: 0.1, y: 0.1, z: 0.05 },
      homeOffset: { x: 0, y: 0, z: 0 },
      probeOffset: { x: 0, y: 0, z: 0 },
    },
  },
  ui: {
    theme: 'dark',
    animations: true,
    compactMode: false,
    showTooltips: true,
    defaultView: 'dashboard',
  },
  performance: {
    maxHistoryEntries: 1000,
    chartUpdateInterval: 1000,
    enableOptimizations: true,
    lowPowerMode: false,
  },
  security: {
    requireConfirmation: true,
    emergencyStopDelay: 0,
    sessionTimeout: 3600000, // 1 hour
  },
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

const validationRules = {
  'machine.workingArea.width': (value: number) => {
    if (value <= 0) return 'Working area width must be greater than 0';
    if (value > 10000) return 'Working area width cannot exceed 10000mm';
    return null;
  },
  'machine.workingArea.height': (value: number) => {
    if (value <= 0) return 'Working area height must be greater than 0';
    if (value > 10000) return 'Working area height cannot exceed 10000mm';
    return null;
  },
  'machine.workingArea.depth': (value: number) => {
    if (value <= 0) return 'Working area depth must be greater than 0';
    if (value > 1000) return 'Working area depth cannot exceed 1000mm';
    return null;
  },
  'machine.movement.maxFeedRate': (value: number) => {
    if (value <= 0) return 'Max feed rate must be greater than 0';
    if (value > 50000) return 'Max feed rate cannot exceed 50000 mm/min';
    return null;
  },
  'machine.movement.defaultFeedRate': (value: number, settings: AppSettings) => {
    if (value <= 0) return 'Default feed rate must be greater than 0';
    if (value > settings.machine.movement.maxFeedRate) {
      return 'Default feed rate cannot exceed max feed rate';
    }
    return null;
  },
  'machine.safety.temperatureLimit': (value: number) => {
    if (value < 0) return 'Temperature limit cannot be negative';
    if (value > 100) return 'Temperature limit cannot exceed 100°C';
    return null;
  },
  'machine.safety.maxSpindleSpeed': (value: number) => {
    if (value <= 0) return 'Max spindle speed must be greater than 0';
    if (value > 100000) return 'Max spindle speed cannot exceed 100000 RPM';
    return null;
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getNestedValue = (obj: any, path: string): any => path.split('.').reduce((current, key) => current?.[key], obj);

const setNestedValue = (obj: any, path: string, value: any): void => {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!(key in current)) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useSettingsStore = create<SettingsStore>()((
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial State
        settings: defaultSettings,
        isLoaded: false,
        lastSaved: null,
        hasUnsavedChanges: false,
        validationErrors: {},

        // Settings Update Actions
        updateGeneralSettings: (generalSettings) => set((state) => {
          Object.assign(state.settings.general, generalSettings);
          state.hasUnsavedChanges = true;
          get().validateSettings();
        }),

        updateMachineSettings: (machineSettings) => set((state) => {
          Object.assign(state.settings.machine, machineSettings);
          state.hasUnsavedChanges = true;
          get().validateSettings();
        }),

        updateUISettings: (uiSettings) => set((state) => {
          Object.assign(state.settings.ui, uiSettings);
          state.hasUnsavedChanges = true;
          get().validateSettings();
        }),

        updatePerformanceSettings: (performanceSettings) => set((state) => {
          Object.assign(state.settings.performance, performanceSettings);
          state.hasUnsavedChanges = true;
          get().validateSettings();
        }),

        updateSecuritySettings: (securitySettings) => set((state) => {
          Object.assign(state.settings.security, securitySettings);
          state.hasUnsavedChanges = true;
          get().validateSettings();
        }),

        // Specific Machine Settings
        updateWorkingArea: (area) => set((state) => {
          state.settings.machine.workingArea = area;
          state.hasUnsavedChanges = true;
          get().validateSettings();
        }),

        updateMovementSettings: (movementSettings) => set((state) => {
          Object.assign(state.settings.machine.movement, movementSettings);
          state.hasUnsavedChanges = true;
          get().validateSettings();
        }),

        updateSafetySettings: (safetySettings) => set((state) => {
          Object.assign(state.settings.machine.safety, safetySettings);
          state.hasUnsavedChanges = true;
          get().validateSettings();
        }),

        updateCalibrationSettings: (calibrationSettings) => set((state) => {
          Object.assign(state.settings.machine.calibration, calibrationSettings);
          state.hasUnsavedChanges = true;
          get().validateSettings();
        }),

        updateConnectionSettings: (connectionSettings) => set((state) => {
          Object.assign(state.settings.machine.connection, connectionSettings);
          state.hasUnsavedChanges = true;
          get().validateSettings();
        }),

        // Validation and Persistence
        validateSettings: () => {
          const state = get();
          const errors: Record<string, string[]> = {};

          Object.entries(validationRules).forEach(([path, validator]) => {
            const value = getNestedValue(state.settings, path);
            const error = validator(value, state.settings);

            if (error) {
              const pathParts = path.split('.');
              const errorKey = pathParts.slice(0, -1).join('.');

              if (!errors[errorKey]) {
                errors[errorKey] = [];
              }
              errors[errorKey].push(error);
            }
          });

          set((draft) => {
            draft.validationErrors = errors;
          });

          return Object.keys(errors).length === 0;
        },

        saveSettings: async () => {
          const state = get();

          if (!state.validateSettings()) {
            throw new Error('Cannot save settings with validation errors');
          }

          try {
            // In a real implementation, this would save to backend/file system
            await new Promise((resolve) => setTimeout(resolve, 500));

            set((draft) => {
              draft.lastSaved = new Date();
              draft.hasUnsavedChanges = false;
            });
          } catch (error) {
            throw new Error(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        },

        loadSettings: async () => {
          try {
            // In a real implementation, this would load from backend/file system
            await new Promise((resolve) => setTimeout(resolve, 300));

            set((draft) => {
              draft.isLoaded = true;
              draft.hasUnsavedChanges = false;
            });

            get().validateSettings();
          } catch (error) {
            throw new Error(`Failed to load settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        },

        resetToDefaults: () => set((state) => {
          state.settings = JSON.parse(JSON.stringify(defaultSettings));
          state.hasUnsavedChanges = true;
          state.validationErrors = {};
          get().validateSettings();
        }),

        exportSettings: () => {
          const state = get();
          return JSON.stringify(state.settings, null, 2);
        },

        importSettings: async (settingsJson) => {
          try {
            const importedSettings = JSON.parse(settingsJson);

            // Validate imported settings structure
            const requiredKeys = ['general', 'machine', 'ui', 'performance', 'security'];
            const missingKeys = requiredKeys.filter((key) => !(key in importedSettings));

            if (missingKeys.length > 0) {
              throw new Error(`Missing required settings sections: ${missingKeys.join(', ')}`);
            }

            set((draft) => {
              draft.settings = { ...defaultSettings, ...importedSettings };
              draft.hasUnsavedChanges = true;
            });

            const isValid = get().validateSettings();
            if (!isValid) {
              throw new Error('Imported settings contain validation errors');
            }
          } catch (error) {
            throw new Error(`Failed to import settings: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
          }
        },

        // Utility Actions
        getSetting: <T = any>(path: string): T | undefined => {
          const state = get();
          return getNestedValue(state.settings, path) as T;
        },

        setSetting: (path, value) => set((state) => {
          setNestedValue(state.settings, path, value);
          state.hasUnsavedChanges = true;
          get().validateSettings();
        }),

        getValidationErrors: (path) => {
          const state = get();
          if (path) {
            return state.validationErrors[path] || [];
          }
          return Object.values(state.validationErrors).flat();
        },

        clearValidationErrors: (path) => set((state) => {
          if (path) {
            delete state.validationErrors[path];
          } else {
            state.validationErrors = {};
          }
        }),

        reset: () => set((state) => {
          state.settings = JSON.parse(JSON.stringify(defaultSettings));
          state.isLoaded = false;
          state.lastSaved = null;
          state.hasUnsavedChanges = false;
          state.validationErrors = {};
        }),
      }),
    ),
    {
      name: 'settings-store',
      storage: localStorage,
      partialize: (state) => ({
        settings: state.settings,
        lastSaved: state.lastSaved,
      }),
      version: 1,
    },
  )
));

// ============================================================================
// STORE SELECTORS
// ============================================================================

export const settingsSelectors = {
  settings: (state: SettingsStore) => state.settings,
  generalSettings: (state: SettingsStore) => state.settings.general,
  machineSettings: (state: SettingsStore) => state.settings.machine,
  uiSettings: (state: SettingsStore) => state.settings.ui,
  performanceSettings: (state: SettingsStore) => state.settings.performance,
  securitySettings: (state: SettingsStore) => state.settings.security,
  workingArea: (state: SettingsStore) => state.settings.machine.workingArea,
  connectionSettings: (state: SettingsStore) => state.settings.machine.connection,
  movementSettings: (state: SettingsStore) => state.settings.machine.movement,
  safetySettings: (state: SettingsStore) => state.settings.machine.safety,
  calibrationSettings: (state: SettingsStore) => state.settings.machine.calibration,
  hasUnsavedChanges: (state: SettingsStore) => state.hasUnsavedChanges,
  isLoaded: (state: SettingsStore) => state.isLoaded,
  lastSaved: (state: SettingsStore) => state.lastSaved,
  validationErrors: (state: SettingsStore) => state.validationErrors,
  hasValidationErrors: (state: SettingsStore) => Object.keys(state.validationErrors).length > 0,
  isValid: (state: SettingsStore) => Object.keys(state.validationErrors).length === 0,
};

// ============================================================================
// SETTINGS PRESETS
// ============================================================================

export const settingsPresets = {
  hobbyist: {
    ...defaultSettings,
    machine: {
      ...defaultSettings.machine,
      workingArea: {
        width: 200, height: 200, depth: 50, units: 'mm' as const,
      },
      movement: {
        ...defaultSettings.machine.movement,
        maxFeedRate: 2000,
        defaultFeedRate: 800,
        rapidSpeed: 3000,
      },
      safety: {
        ...defaultSettings.machine.safety,
        maxSpindleSpeed: 12000,
        temperatureLimit: 50,
      },
    },
    performance: {
      ...defaultSettings.performance,
      maxHistoryEntries: 500,
      chartUpdateInterval: 2000,
    },
  },

  professional: {
    ...defaultSettings,
    machine: {
      ...defaultSettings.machine,
      workingArea: {
        width: 600, height: 400, depth: 150, units: 'mm' as const,
      },
      movement: {
        ...defaultSettings.machine.movement,
        maxFeedRate: 5000,
        defaultFeedRate: 1500,
        rapidSpeed: 8000,
      },
      safety: {
        ...defaultSettings.machine.safety,
        maxSpindleSpeed: 30000,
        temperatureLimit: 70,
      },
    },
    performance: {
      ...defaultSettings.performance,
      maxHistoryEntries: 2000,
      chartUpdateInterval: 500,
    },
  },

  industrial: {
    ...defaultSettings,
    machine: {
      ...defaultSettings.machine,
      workingArea: {
        width: 1200, height: 800, depth: 300, units: 'mm' as const,
      },
      movement: {
        ...defaultSettings.machine.movement,
        maxFeedRate: 10000,
        defaultFeedRate: 2500,
        rapidSpeed: 15000,
      },
      safety: {
        ...defaultSettings.machine.safety,
        maxSpindleSpeed: 60000,
        temperatureLimit: 80,
      },
    },
    performance: {
      ...defaultSettings.performance,
      maxHistoryEntries: 5000,
      chartUpdateInterval: 250,
      enableOptimizations: true,
    },
    security: {
      ...defaultSettings.security,
      requireConfirmation: true,
      emergencyStopDelay: 1000,
      sessionTimeout: 1800000, // 30 minutes
    },
  },
};

export const applySettingsPreset = (preset: keyof typeof settingsPresets) => {
  const store = useSettingsStore.getState();
  const presetSettings = settingsPresets[preset];

  store.updateGeneralSettings(presetSettings.general);
  store.updateMachineSettings(presetSettings.machine);
  store.updateUISettings(presetSettings.ui);
  store.updatePerformanceSettings(presetSettings.performance);
  store.updateSecuritySettings(presetSettings.security);
};

// ============================================================================
// STORE SUBSCRIPTIONS
// ============================================================================

// Auto-save settings when enabled
useSettingsStore.subscribe(
  (state) => [state.hasUnsavedChanges, state.settings.general.autoSave],
  ([hasChanges, autoSave]) => {
    if (hasChanges && autoSave) {
      const store = useSettingsStore.getState();
      if (store.isValid) {
        // Debounce auto-save
        setTimeout(() => {
          if (store.hasUnsavedChanges) {
            store.saveSettings().catch(console.error);
          }
        }, 5000);
      }
    }
  },
);

// Initialize settings on first load
if (typeof window !== 'undefined') {
  useSettingsStore.getState().loadSettings().catch(console.error);
}

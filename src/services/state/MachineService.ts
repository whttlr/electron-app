/**
 * Machine State Store
 *
 * Zustand store for CNC machine state management with real-time updates,
 * connection handling, and position tracking.
 */

import create from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
// import { immer } from 'zustand/middleware';
import type {
  MachineState,
  MachineConnection,
  Position3D,
  MachineStatus,
  WorkingArea,
  StoreActions,
  RealTimeData,
  ErrorState,
} from './types';

// ============================================================================
// STORE STATE INTERFACE
// ============================================================================

export interface MachineStore {
  // Machine State
  machine: MachineState;
  connection: MachineConnection;
  workingArea: WorkingArea;

  // Real-time Data
  isConnected: boolean;
  lastUpdate: Date | null;
  connectionAttempts: number;
  maxConnectionAttempts: number;

  // Position Tracking
  positionHistory: Array<{ position: Position3D; timestamp: Date }>;
  homePosition: Position3D;
  workOrigin: Position3D;

  // Status and Errors
  status: MachineStatus;
  errors: ErrorState[];
  warnings: string[];

  // Actions
  updateMachineState: (updates: Partial<MachineState>) => void;
  updatePosition: (position: Position3D) => void;
  updateStatus: (status: MachineStatus) => void;
  setConnection: (connection: Partial<MachineConnection>) => void;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addError: (error: Omit<ErrorState, 'id' | 'timestamp'>) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  addWarning: (warning: string) => void;
  clearWarnings: () => void;
  setWorkingArea: (area: WorkingArea) => void;
  setHomePosition: (position: Position3D) => void;
  setWorkOrigin: (position: Position3D) => void;
  homeAxis: (axes: ('X' | 'Y' | 'Z')[]) => Promise<void>;
  jogTo: (position: Position3D) => Promise<void>;
  emergencyStop: () => Promise<void>;
  reset: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialMachineState: MachineState = {
  id: 'cnc-machine-1',
  name: 'CNC Machine',
  status: 'disconnected',
  position: { x: 0, y: 0, z: 0 },
  workOrigin: { x: 0, y: 0, z: 0 },
  feedRate: 1000,
  spindleSpeed: 0,
  temperature: 25,
  lastUpdate: new Date(),
  errors: [],
  warnings: [],
};

const initialConnection: MachineConnection = {
  type: 'serial',
  port: '/dev/ttyUSB0',
  baudRate: 115200,
  isConnected: false,
};

const initialWorkingArea: WorkingArea = {
  width: 300,
  height: 300,
  depth: 100,
  units: 'mm',
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useMachineStore = create<MachineStore>()((
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial State
        machine: initialMachineState,
        connection: initialConnection,
        workingArea: initialWorkingArea,
        isConnected: false,
        lastUpdate: null,
        connectionAttempts: 0,
        maxConnectionAttempts: 3,
        positionHistory: [],
        homePosition: { x: 0, y: 0, z: 0 },
        workOrigin: { x: 0, y: 0, z: 0 },
        status: 'disconnected',
        errors: [],
        warnings: [],

        // Actions
        updateMachineState: (updates) => set((state) => {
          Object.assign(state.machine, updates);
          state.lastUpdate = new Date();
        }),

        updatePosition: (position) => set((state) => {
          state.machine.position = position;
          state.positionHistory.push({
            position,
            timestamp: new Date(),
          });

          // Keep only last 100 position entries
          if (state.positionHistory.length > 100) {
            state.positionHistory = state.positionHistory.slice(-100);
          }

          state.lastUpdate = new Date();
        }),

        updateStatus: (status) => set((state) => {
          state.machine.status = status;
          state.status = status;
          state.lastUpdate = new Date();
        }),

        setConnection: (connectionUpdates) => set((state) => {
          Object.assign(state.connection, connectionUpdates);
        }),

        connect: async () => {
          const state = get();

          if (state.isConnected) {
            return true;
          }

          set((draft) => {
            draft.connectionAttempts += 1;
            draft.status = 'connecting';
            draft.machine.status = 'connecting';
          });

          try {
            // Simulate connection logic
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // In real implementation, this would connect to the actual machine
            const connected = Math.random() > 0.3; // 70% success rate for demo

            if (connected) {
              set((draft) => {
                draft.isConnected = true;
                draft.connection.isConnected = true;
                draft.connection.lastPing = new Date();
                draft.status = 'connected';
                draft.machine.status = 'idle';
                draft.connectionAttempts = 0;
                draft.lastUpdate = new Date();
              });

              return true;
            }
            const currentState = get();
            if (currentState.connectionAttempts >= currentState.maxConnectionAttempts) {
              set((draft) => {
                draft.status = 'error';
                draft.machine.status = 'error';
              });

              get().addError({
                type: 'machine',
                severity: 'high',
                message: 'Failed to connect to machine after multiple attempts',
              });
            } else {
              set((draft) => {
                draft.status = 'disconnected';
                draft.machine.status = 'disconnected';
              });
            }

            return false;
          } catch (error) {
            set((draft) => {
              draft.status = 'error';
              draft.machine.status = 'error';
            });

            get().addError({
              type: 'network',
              severity: 'high',
              message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });

            return false;
          }
        },

        disconnect: () => set((state) => {
          state.isConnected = false;
          state.connection.isConnected = false;
          state.status = 'disconnected';
          state.machine.status = 'disconnected';
          state.connectionAttempts = 0;
          state.lastUpdate = new Date();
        }),

        addError: (error) => set((state) => {
          const newError: ErrorState = {
            ...error,
            id: `error-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            resolved: false,
          };

          state.errors.push(newError);
          state.machine.errors.push(newError.message);

          // Keep only last 50 errors
          if (state.errors.length > 50) {
            state.errors = state.errors.slice(-50);
          }
        }),

        removeError: (errorId) => set((state) => {
          state.errors = state.errors.filter((e) => e.id !== errorId);
          // Update machine errors array
          state.machine.errors = state.errors.map((e) => e.message);
        }),

        clearErrors: () => set((state) => {
          state.errors = [];
          state.machine.errors = [];
        }),

        addWarning: (warning) => set((state) => {
          state.warnings.push(warning);
          state.machine.warnings.push(warning);

          // Keep only last 20 warnings
          if (state.warnings.length > 20) {
            state.warnings = state.warnings.slice(-20);
            state.machine.warnings = state.warnings;
          }
        }),

        clearWarnings: () => set((state) => {
          state.warnings = [];
          state.machine.warnings = [];
        }),

        setWorkingArea: (area) => set((state) => {
          state.workingArea = area;
        }),

        setHomePosition: (position) => set((state) => {
          state.homePosition = position;
        }),

        setWorkOrigin: (position) => set((state) => {
          state.workOrigin = position;
          state.machine.workOrigin = position;
        }),

        homeAxis: async (axes) => {
          const state = get();

          if (!state.isConnected) {
            throw new Error('Machine not connected');
          }

          set((draft) => {
            draft.status = 'homing';
            draft.machine.status = 'homing';
          });

          try {
            // Simulate homing process
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Move to home position for specified axes
            const currentPosition = state.machine.position;
            const { homePosition } = state;

            const newPosition = {
              x: axes.includes('X') ? homePosition.x : currentPosition.x,
              y: axes.includes('Y') ? homePosition.y : currentPosition.y,
              z: axes.includes('Z') ? homePosition.z : currentPosition.z,
            };

            set((draft) => {
              draft.machine.position = newPosition;
              draft.status = 'idle';
              draft.machine.status = 'idle';
            });

            get().updatePosition(newPosition);
          } catch (error) {
            set((draft) => {
              draft.status = 'error';
              draft.machine.status = 'error';
            });

            get().addError({
              type: 'machine',
              severity: 'high',
              message: `Homing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });

            throw error;
          }
        },

        jogTo: async (position) => {
          const state = get();

          if (!state.isConnected) {
            throw new Error('Machine not connected');
          }

          if (state.status !== 'idle') {
            throw new Error('Machine not in idle state');
          }

          set((draft) => {
            draft.status = 'running';
            draft.machine.status = 'running';
          });

          try {
            // Simulate movement
            await new Promise((resolve) => setTimeout(resolve, 1000));

            set((draft) => {
              draft.machine.position = position;
              draft.status = 'idle';
              draft.machine.status = 'idle';
            });

            get().updatePosition(position);
          } catch (error) {
            set((draft) => {
              draft.status = 'error';
              draft.machine.status = 'error';
            });

            get().addError({
              type: 'machine',
              severity: 'high',
              message: `Movement failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });

            throw error;
          }
        },

        emergencyStop: async () => {
          set((draft) => {
            draft.status = 'emergency';
            draft.machine.status = 'emergency';
            draft.machine.spindleSpeed = 0;
            draft.machine.feedRate = 0;
          });

          get().addError({
            type: 'machine',
            severity: 'critical',
            message: 'Emergency stop activated',
          });

          // In real implementation, this would send emergency stop command
          await new Promise((resolve) => setTimeout(resolve, 100));
        },

        reset: () => set((state) => {
          state.machine = initialMachineState;
          state.connection = initialConnection;
          state.workingArea = initialWorkingArea;
          state.isConnected = false;
          state.lastUpdate = null;
          state.connectionAttempts = 0;
          state.positionHistory = [];
          state.homePosition = { x: 0, y: 0, z: 0 };
          state.workOrigin = { x: 0, y: 0, z: 0 };
          state.status = 'disconnected';
          state.errors = [];
          state.warnings = [];
        }),
      }),
    ),
    {
      name: 'machine-store',
      storage: localStorage,
      partialize: (state) => ({
        workingArea: state.workingArea,
        homePosition: state.homePosition,
        workOrigin: state.workOrigin,
        connection: {
          type: state.connection.type,
          port: state.connection.port,
          ipAddress: state.connection.ipAddress,
          tcpPort: state.connection.tcpPort,
          baudRate: state.connection.baudRate,
        },
      }),
      version: 1,
    },
  )
));

// ============================================================================
// STORE SELECTORS
// ============================================================================

export const machineSelectors = {
  isConnected: (state: MachineStore) => state.isConnected,
  position: (state: MachineStore) => state.machine.position,
  status: (state: MachineStore) => state.status,
  errors: (state: MachineStore) => state.errors,
  warnings: (state: MachineStore) => state.warnings,
  workingArea: (state: MachineStore) => state.workingArea,
  connection: (state: MachineStore) => state.connection,
  canJog: (state: MachineStore) => state.isConnected && state.status === 'idle',
  hasErrors: (state: MachineStore) => state.errors.length > 0,
  hasWarnings: (state: MachineStore) => state.warnings.length > 0,
  criticalErrors: (state: MachineStore) => state.errors.filter((e) => e.severity === 'critical'),
  positionHistory: (state: MachineStore) => state.positionHistory,
  machineInfo: (state: MachineStore) => ({
    id: state.machine.id,
    name: state.machine.name,
    status: state.status,
    temperature: state.machine.temperature,
    spindleSpeed: state.machine.spindleSpeed,
    feedRate: state.machine.feedRate,
    lastUpdate: state.lastUpdate,
  }),
};

// ============================================================================
// REAL-TIME DATA HANDLER
// ============================================================================

export const handleRealTimeData = (data: RealTimeData) => {
  const store = useMachineStore.getState();

  if (data.machineState) {
    store.updateMachineState(data.machineState);
  }

  if (data.machineState?.position) {
    store.updatePosition(data.machineState.position);
  }

  if (data.machineState?.status) {
    store.updateStatus(data.machineState.status);
  }
};

// ============================================================================
// STORE SUBSCRIPTIONS
// ============================================================================

// Auto-reconnect on connection loss
useMachineStore.subscribe(
  (state) => state.isConnected,
  (isConnected, prevConnected) => {
    if (prevConnected && !isConnected) {
      // Connection lost, attempt to reconnect
      const store = useMachineStore.getState();
      if (store.connectionAttempts < store.maxConnectionAttempts) {
        setTimeout(() => {
          store.connect();
        }, 5000); // Retry after 5 seconds
      }
    }
  },
);

// Monitor for critical errors
useMachineStore.subscribe(
  (state) => state.errors,
  (errors) => {
    const criticalErrors = errors.filter((e) => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      // Handle critical errors (e.g., show notifications, emergency stop)
      console.error('Critical machine errors detected:', criticalErrors);
    }
  },
);

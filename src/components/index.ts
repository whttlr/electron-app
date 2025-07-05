// Re-export from modular structure for backward compatibility
export { PluginRenderer } from '../ui/plugin';
export { WorkingAreaPreview, MachineDisplay2D } from '../ui/visualization';

// Database Integration Components
export { default as SupabaseTestComponent } from '../services/database/SupabaseTest';
export { default as MachineConfigManager } from '../services/machine-config/MachineConfigManager';
export { default as JobHistoryView } from '../views/Jobs/JobHistoryView';
export { default as GcodeExecutionExample } from '../services/gcode/GcodeExample';
export { default as DatabaseIntegrationDemo } from '../services/database/DatabaseDemo';

// Connection Management Components
export { default as ConnectionStatus } from '../ui/controls/ConnectionStatus';
export { default as ConnectionModal } from '../ui/shared/ConnectionModal';
export { default as ConnectionManager } from '../services/connection/ConnectionManager';

// G-Code Execution Components
export { default as GcodeRunner } from '../services/gcode/GcodeRunner';
export { default as MachineStatusMonitor } from '../ui/controls/MachineStatusMonitor';

// Error Handling Components
export { default as ErrorBoundary } from '../ui/shared/errorBoundary';
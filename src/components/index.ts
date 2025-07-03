// Re-export from modular structure for backward compatibility
export { PluginRenderer } from '../ui/plugin';
export { WorkingAreaPreview, MachineDisplay2D } from '../ui/visualization';

// Database Integration Components
export { default as SupabaseTestComponent } from './SupabaseTestComponent';
export { default as MachineConfigManager } from './MachineConfigManager';
export { default as JobHistoryView } from './JobHistoryView';
export { default as GcodeExecutionExample } from './GcodeExecutionExample';
export { default as DatabaseIntegrationDemo } from './DatabaseIntegrationDemo';

// Connection Management Components
export { default as ConnectionStatus } from './ConnectionStatus';
export { default as ConnectionModal } from './ConnectionModal';
export { default as ConnectionManager } from './ConnectionManager';

// G-Code Execution Components
export { default as GcodeRunner } from './GcodeRunner';
export { default as MachineStatusMonitor } from './MachineStatusMonitor';

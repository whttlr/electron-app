// Re-export from modular structure for backward compatibility
export { PluginRenderer } from '../ui/plugin';

// UI components moved to @whttlr/ui-cnc and @whttlr/ui-core packages
// Import and re-export common components for backward compatibility
export {
  Button,
  Badge,
  Card,
  Alert,
  Progress,
} from '@whttlr/ui-core';

export {
  JogControls,
  CoordinateDisplay,
  CompactCoordinateDisplay,
  StatusIndicator,
  ConnectionStatus,
  StatusDashboard,
  SafetyControlPanel,
  WorkingAreaPreview,
  MachineDisplay2D,
} from '@whttlr/ui-core';

// Database Integration Components
export { default as SupabaseTestComponent } from '../services/database/SupabaseTest';
export { default as MachineConfigManager } from '../services/machine-config/MachineConfigManager';
export { default as JobHistoryView } from '../views/Jobs/JobHistoryView';
export { default as GcodeExecutionExample } from '../services/gcode/GcodeExample';
export { default as DatabaseIntegrationDemo } from '../services/database/DatabaseDemo';

// Connection Management Components
// ConnectionStatus moved to @whttlr/ui-cnc package
// ConnectionModal moved to @whttlr/ui-core package
export { default as ConnectionManager } from '../services/connection/ConnectionManager';

// G-Code Execution Components
export { default as GcodeRunner } from '../services/gcode/GcodeRunner';
// MachineStatusMonitor moved to @whttlr/ui-cnc package

// Error Handling Components
export { default as ErrorBoundary } from '../ui/shared/errorBoundary';

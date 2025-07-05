// Core Workspace Module - Public API

// Workspace controller
export { WorkspaceController, workspaceController } from './WorkspaceController';

// Workspace types and interfaces
export type { 
  WorkspaceDimensions, 
  WorkspaceOrigin, 
  Material, 
  Fixture, 
  Tool, 
  WorkspaceGrid,
  MeasurementTool,
  WorkspaceState,
  WorkspaceEvent,
  WorkspaceEventHandler 
} from './WorkspaceController';

// Configuration
export { workspaceConfig, type WorkspaceConfig } from './config';

// Module metadata
export const WorkspaceModule = {
  version: '1.0.0',
  description: 'Working area and boundary management',
};

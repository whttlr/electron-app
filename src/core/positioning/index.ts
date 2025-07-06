// Core Positioning Module - Public API

// Positioning controller
export { PositioningController, positioningController } from './PositioningController';

// Position types and interfaces
export type {
  Position,
  CoordinateSystem,
  JogSettings,
  JogCommand,
  PositionHistory,
  HomingSettings,
  PositioningState,
  PositioningEvent,
  PositioningEventHandler,
} from './PositioningController';

// Configuration
export { positioningConfig, type PositioningConfig } from './config';

// Module metadata
export const PositioningModule = {
  version: '1.0.0',
  description: 'Position tracking and jog control logic',
};

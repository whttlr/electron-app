import React from 'react';
import { JogControls } from '@whttlr/ui-core';

interface JogControlsWrapperProps {
  onJog: (axis: 'x' | 'y' | 'z', direction: 1 | -1) => void;
  jogDistance: number;
  onJogDistanceChange: (distance: number) => void;
  isConnected: boolean;
  availableIncrements: number[];
}

/**
 * Wrapper for JogControls that applies proper CNC theme styling
 * without affecting the rest of the app
 */
export const JogControlsWrapper: React.FC<JogControlsWrapperProps> = (props) => {
  return (
    <div className="cnc-panel">
      <JogControls {...props} />
    </div>
  );
};
/**
 * TouchJogControls Component
 * 
 * Touch-optimized jog controls for industrial tablets and mobile devices.
 * Features large touch targets, haptic feedback, gesture support, and
 * adaptive layouts for different orientations.
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { useResponsive, touchTargets } from '../../theme/responsive';
import { TouchButton } from './TouchButton';
import { Home, Move, RotateCcw, Lock, Unlock } from 'lucide-react';

interface Position3D {
  x: number;
  y: number;
  z: number;
}

interface WorkingArea {
  width: number;
  height: number;
  depth: number;
  units: 'mm' | 'in';
}

export interface TouchJogControlsProps {
  /** Current machine position */
  position: Position3D;
  /** Available jog step sizes */
  stepSizes?: number[];
  /** Current selected step size */
  selectedStepSize?: number;
  /** Working area limits */
  workingArea?: WorkingArea;
  /** Whether controls are disabled */
  disabled?: boolean;
  /** Jog action handler */
  onJog: (axis: 'X' | 'Y' | 'Z', direction: 1 | -1, distance: number) => void;
  /** Home action handler */
  onHome: (axes: Array<'X' | 'Y' | 'Z'>) => void;
  /** Step size change handler */
  onStepSizeChange?: (stepSize: number) => void;
  /** Enable continuous jog mode */
  enableContinuousJog?: boolean;
  /** Continuous jog interval in ms */
  continuousJogInterval?: number;
  /** Enable gesture controls */
  enableGestures?: boolean;
  /** Show coordinate display */
  showCoordinates?: boolean;
  /** Compact mode for small screens */
  compact?: boolean;
}

export const TouchJogControls: React.FC<TouchJogControlsProps> = ({
  position,
  stepSizes = [0.1, 1, 10, 100],
  selectedStepSize,
  workingArea,
  disabled = false,
  onJog,
  onHome,
  onStepSizeChange,
  enableContinuousJog = true,
  continuousJogInterval = 100,
  enableGestures = true,
  showCoordinates = true,
  compact = false,
}) => {
  const { isTouchDevice, orientation, breakpoint } = useResponsive();
  const [currentStepSize, setCurrentStepSize] = useState(selectedStepSize || stepSizes[1]);
  const [isLocked, setIsLocked] = useState(false);
  const [activeJogDirection, setActiveJogDirection] = useState<string | null>(null);
  const [longPressActive, setLongPressActive] = useState<string | null>(null);
  
  // Refs for continuous jogging
  const jogIntervalRef = useRef<NodeJS.Timeout>();
  const longPressTimeoutRef = useRef<NodeJS.Timeout>();
  const touchStartTimeRef = useRef<number>(0);

  // Auto-adjust layout based on screen size and orientation
  const isCompactMode = compact || breakpoint === 'xs' || breakpoint === 'sm';
  const useVerticalLayout = orientation === 'portrait' || isCompactMode;

  // Handle step size change
  const handleStepSizeChange = useCallback((stepSize: number) => {
    setCurrentStepSize(stepSize);
    onStepSizeChange?.(stepSize);
  }, [onStepSizeChange]);

  // Check if jog movement is allowed
  const canJog = useCallback((axis: 'X' | 'Y' | 'Z', direction: 1 | -1): boolean => {
    if (disabled || isLocked) return false;
    
    if (!workingArea) return true;
    
    const newPosition = { ...position };
    newPosition[axis.toLowerCase() as keyof Position3D] += direction * currentStepSize;
    
    // Check boundaries
    switch (axis) {
      case 'X':
        return newPosition.x >= 0 && newPosition.x <= workingArea.width;
      case 'Y':
        return newPosition.y >= 0 && newPosition.y <= workingArea.height;
      case 'Z':
        return newPosition.z >= 0 && newPosition.z <= workingArea.depth;
      default:
        return true;
    }
  }, [disabled, isLocked, workingArea, position, currentStepSize]);

  // Handle single jog
  const handleJog = useCallback((axis: 'X' | 'Y' | 'Z', direction: 1 | -1) => {
    if (canJog(axis, direction)) {
      onJog(axis, direction, currentStepSize);
    }
  }, [canJog, onJog, currentStepSize]);

  // Handle continuous jog start
  const startContinuousJog = useCallback((axis: 'X' | 'Y' | 'Z', direction: 1 | -1) => {
    if (!enableContinuousJog || !canJog(axis, direction)) return;
    
    setActiveJogDirection(`${axis}${direction > 0 ? '+' : '-'}`);
    
    // Start continuous jogging
    jogIntervalRef.current = setInterval(() => {
      if (canJog(axis, direction)) {
        onJog(axis, direction, currentStepSize);
      } else {
        stopContinuousJog();
      }
    }, continuousJogInterval);
  }, [enableContinuousJog, canJog, onJog, currentStepSize, continuousJogInterval]);

  // Handle continuous jog stop
  const stopContinuousJog = useCallback(() => {
    if (jogIntervalRef.current) {
      clearInterval(jogIntervalRef.current);
      jogIntervalRef.current = undefined;
    }
    setActiveJogDirection(null);
    setLongPressActive(null);
  }, []);

  // Handle touch start for long press
  const handleTouchStart = useCallback((axis: 'X' | 'Y' | 'Z', direction: 1 | -1) => {
    touchStartTimeRef.current = Date.now();
    
    if (!enableContinuousJog) return;
    
    // Set up long press detection
    longPressTimeoutRef.current = setTimeout(() => {
      setLongPressActive(`${axis}${direction > 0 ? '+' : '-'}`);
      startContinuousJog(axis, direction);
    }, 500); // 500ms for long press
  }, [enableContinuousJog, startContinuousJog]);

  // Handle touch end
  const handleTouchEnd = useCallback((axis: 'X' | 'Y' | 'Z', direction: 1 | -1) => {
    const touchDuration = Date.now() - touchStartTimeRef.current;
    
    // Clear long press timeout
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = undefined;
    }
    
    // Stop continuous jog if active
    if (activeJogDirection === `${axis}${direction > 0 ? '+' : '-'}`) {
      stopContinuousJog();
    }
    
    // Handle single tap (short press)
    if (touchDuration < 500 && !longPressActive) {
      handleJog(axis, direction);
    }
  }, [activeJogDirection, longPressActive, handleJog, stopContinuousJog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopContinuousJog();
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, [stopContinuousJog]);

  // Handle home all axes
  const handleHomeAll = useCallback(() => {
    onHome(['X', 'Y', 'Z']);
  }, [onHome]);

  // Handle individual axis home
  const handleHomeAxis = useCallback((axis: 'X' | 'Y' | 'Z') => {
    onHome([axis]);
  }, [onHome]);

  // Jog button component
  const JogButton: React.FC<{
    axis: 'X' | 'Y' | 'Z';
    direction: 1 | -1;
    label: string;
    className?: string;
    size?: 'md' | 'lg' | 'touch' | 'touch-lg';
  }> = ({ axis, direction, label, className, size = 'touch-lg' }) => {
    const jogKey = `${axis}${direction > 0 ? '+' : '-'}`;
    const isActive = activeJogDirection === jogKey;
    const isDisabledForDirection = !canJog(axis, direction);
    
    return (
      <TouchButton
        variant={isActive ? 'primary' : 'secondary'}
        size={size}
        disabled={disabled || isDisabledForDirection}
        className={cn(
          'relative transition-all duration-200',
          isActive && 'ring-2 ring-blue-400 shadow-lg',
          longPressActive === jogKey && 'animate-pulse',
          className
        )}
        onTouchStart={(e) => {
          e.preventDefault();
          handleTouchStart(axis, direction);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTouchEnd(axis, direction);
        }}
        onMouseDown={() => !isTouchDevice && handleTouchStart(axis, direction)}
        onMouseUp={() => !isTouchDevice && handleTouchEnd(axis, direction)}
        onMouseLeave={() => !isTouchDevice && stopContinuousJog()}
        hapticFeedback={true}
        showPressAnimation={true}
        aria-label={`Jog ${axis} axis ${direction > 0 ? 'positive' : 'negative'} by ${currentStepSize}${workingArea?.units || 'mm'}`}
      >
        <span className="text-lg font-bold">{label}</span>
        {isActive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" />
        )}
      </TouchButton>
    );
  };

  // Position display component
  const PositionDisplay: React.FC = () => (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-2">Current Position</h3>
      <div className="grid grid-cols-3 gap-3">
        {(['X', 'Y', 'Z'] as const).map((axis) => (
          <div key={axis} className="text-center">
            <div className="text-xs text-gray-400 mb-1">{axis}</div>
            <div className="text-lg font-mono text-white">
              {position[axis.toLowerCase() as keyof Position3D].toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">{workingArea?.units || 'mm'}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Step size selector
  const StepSizeSelector: React.FC = () => (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Step Size</h3>
      <div className="grid grid-cols-2 gap-2">
        {stepSizes.map((stepSize) => (
          <TouchButton
            key={stepSize}
            variant={stepSize === currentStepSize ? 'primary' : 'ghost'}
            size="md"
            onClick={() => handleStepSizeChange(stepSize)}
            disabled={disabled}
            className="text-sm"
          >
            {stepSize} {workingArea?.units || 'mm'}
          </TouchButton>
        ))}
      </div>
    </div>
  );

  // Compact layout for small screens
  if (isCompactMode) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-4">
        {showCoordinates && <PositionDisplay />}
        
        {/* XY Controls */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">XY Controls</h3>
          <div className="grid grid-cols-3 gap-2 w-full max-w-48 mx-auto">
            <div /> {/* Empty top-left */}
            <JogButton axis="Y" direction={1} label="Y+" size="touch" />
            <div /> {/* Empty top-right */}
            
            <JogButton axis="X" direction={-1} label="X-" size="touch" />
            <TouchButton
              variant="secondary"
              size="touch"
              onClick={handleHomeAll}
              disabled={disabled}
              icon={<Home size={16} />}
              aria-label="Home all axes"
            >
              <Home size={16} />
            </TouchButton>
            <JogButton axis="X" direction={1} label="X+" size="touch" />
            
            <div /> {/* Empty bottom-left */}
            <JogButton axis="Y" direction={-1} label="Y-" size="touch" />
            <div /> {/* Empty bottom-right */}
          </div>
        </div>

        {/* Z Controls */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">Z Controls</h3>
          <div className="flex justify-center gap-4">
            <JogButton axis="Z" direction={1} label="Z+" size="touch" />
            <JogButton axis="Z" direction={-1} label="Z-" size="touch" />
          </div>
        </div>

        <StepSizeSelector />
        
        {/* Lock toggle */}
        <TouchButton
          variant={isLocked ? 'warning' : 'ghost'}
          size="md"
          fullWidth
          onClick={() => setIsLocked(!isLocked)}
          icon={isLocked ? <Lock size={16} /> : <Unlock size={16} />}
        >
          {isLocked ? 'Unlock Controls' : 'Lock Controls'}
        </TouchButton>
      </div>
    );
  }

  // Full layout for larger screens
  return (
    <div className={cn(
      'grid gap-6 w-full max-w-4xl mx-auto',
      useVerticalLayout ? 'grid-cols-1' : 'grid-cols-2'
    )}>
      {/* Left column / Top section */}
      <div className="space-y-4">
        {showCoordinates && <PositionDisplay />}
        <StepSizeSelector />
        
        {/* Control lock */}
        <TouchButton
          variant={isLocked ? 'warning' : 'ghost'}
          size="md"
          fullWidth
          onClick={() => setIsLocked(!isLocked)}
          icon={isLocked ? <Lock size={20} /> : <Unlock size={20} />}
        >
          {isLocked ? 'Unlock Controls' : 'Lock Controls'}
        </TouchButton>
      </div>

      {/* Right column / Bottom section */}
      <div className="space-y-4">
        {/* XY Jog Controls */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-medium text-gray-300 mb-4 text-center">XY Controls</h3>
          <div className="grid grid-cols-3 gap-4 w-full max-w-xs mx-auto">
            <div /> {/* Empty top-left */}
            <JogButton axis="Y" direction={1} label="Y+" />
            <div /> {/* Empty top-right */}
            
            <JogButton axis="X" direction={-1} label="X-" />
            <TouchButton
              variant="secondary"
              size="touch-lg"
              onClick={handleHomeAll}
              disabled={disabled}
              icon={<Home size={24} />}
              aria-label="Home all axes"
            >
              <Home size={24} />
            </TouchButton>
            <JogButton axis="X" direction={1} label="X+" />
            
            <div /> {/* Empty bottom-left */}
            <JogButton axis="Y" direction={-1} label="Y-" />
            <div /> {/* Empty bottom-right */}
          </div>
        </div>

        {/* Z Controls */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-medium text-gray-300 mb-4 text-center">Z Controls</h3>
          <div className="flex justify-center gap-6">
            <JogButton axis="Z" direction={1} label="Z+" />
            <JogButton axis="Z" direction={-1} label="Z-" />
          </div>
        </div>

        {/* Individual axis home buttons */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">Home Individual Axes</h3>
          <div className="flex justify-center gap-3">
            {(['X', 'Y', 'Z'] as const).map((axis) => (
              <TouchButton
                key={axis}
                variant="ghost"
                size="md"
                onClick={() => handleHomeAxis(axis)}
                disabled={disabled}
                className="text-sm"
              >
                Home {axis}
              </TouchButton>
            ))}
          </div>
        </div>
      </div>

      {/* Continuous jog instructions */}
      {enableContinuousJog && (
        <div className="col-span-full bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
          <p className="text-blue-200 text-sm text-center">
            💡 Tip: {isTouchDevice ? 'Long press' : 'Hold down'} jog buttons for continuous movement
          </p>
        </div>
      )}
    </div>
  );
};

export default TouchJogControls;
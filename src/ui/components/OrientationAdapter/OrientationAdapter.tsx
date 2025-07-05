/**
 * OrientationAdapter Component
 * 
 * Handles tablet orientation changes and provides adaptive layouts
 * for landscape/portrait modes. Critical for industrial tablets
 * that may be rotated during operation.
 */

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { useResponsive } from '@/ui/theme/responsive';
import { TouchButton } from '../TouchOptimized/TouchButton';
import { RotateCcw, Lock, Unlock, Maximize2, Minimize2 } from 'lucide-react';

export type OrientationMode = 'auto' | 'portrait' | 'landscape' | 'locked';

export interface OrientationLayout {
  portrait: ReactNode;
  landscape: ReactNode;
  transition?: 'fade' | 'slide' | 'none';
  lockable?: boolean;
}

export interface OrientationAdapterProps {
  /** Layout configuration for different orientations */
  layout: OrientationLayout;
  /** Initial orientation mode */
  initialMode?: OrientationMode;
  /** Show orientation controls */
  showControls?: boolean;
  /** Control position */
  controlPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Enable fullscreen mode */
  enableFullscreen?: boolean;
  /** Orientation change callback */
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
  /** Mode change callback */
  onModeChange?: (mode: OrientationMode) => void;
  /** Custom orientation detection */
  customOrientationDetection?: () => 'portrait' | 'landscape';
  /** Transition duration in ms */
  transitionDuration?: number;
  /** Minimum screen dimensions for landscape */
  landscapeMinWidth?: number;
  landscapeMinHeight?: number;
}

export const OrientationAdapter: React.FC<OrientationAdapterProps> = ({
  layout,
  initialMode = 'auto',
  showControls = true,
  controlPosition = 'top-right',
  enableFullscreen = true,
  onOrientationChange,
  onModeChange,
  customOrientationDetection,
  transitionDuration = 300,
  landscapeMinWidth = 768,
  landscapeMinHeight = 480,
}) => {
  const { orientation: detectedOrientation, breakpoint } = useResponsive();
  const [mode, setMode] = useState<OrientationMode>(initialMode);
  const [forcedOrientation, setForcedOrientation] = useState<'portrait' | 'landscape' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);

  // Determine effective orientation
  const getEffectiveOrientation = useCallback((): 'portrait' | 'landscape' => {
    if (customOrientationDetection) {
      return customOrientationDetection();
    }

    if (mode === 'portrait') return 'portrait';
    if (mode === 'landscape') return 'landscape';
    if (mode === 'locked' && forcedOrientation) return forcedOrientation;

    // Auto mode - use detected orientation with size constraints
    const isLargeEnoughForLandscape = 
      window.innerWidth >= landscapeMinWidth && 
      window.innerHeight >= landscapeMinHeight;

    return (detectedOrientation === 'landscape' && isLargeEnoughForLandscape) 
      ? 'landscape' 
      : 'portrait';
  }, [mode, forcedOrientation, detectedOrientation, customOrientationDetection, landscapeMinWidth, landscapeMinHeight]);

  const [currentOrientation, setCurrentOrientation] = useState(getEffectiveOrientation());

  // Handle orientation changes
  useEffect(() => {
    const newOrientation = getEffectiveOrientation();
    
    if (newOrientation !== currentOrientation) {
      setIsTransitioning(true);
      
      const transitionTimeout = setTimeout(() => {
        setCurrentOrientation(newOrientation);
        onOrientationChange?.(newOrientation);
        
        // End transition after layout change
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, layout.transition === 'none' ? 0 : transitionDuration / 2);

      return () => clearTimeout(transitionTimeout);
    }
  }, [currentOrientation, getEffectiveOrientation, onOrientationChange, layout.transition, transitionDuration]);

  // Handle mode changes
  const handleModeChange = useCallback((newMode: OrientationMode) => {
    setMode(newMode);
    onModeChange?.(newMode);

    if (newMode === 'locked') {
      setForcedOrientation(currentOrientation);
    } else {
      setForcedOrientation(null);
    }

    setShowModeSelector(false);
  }, [currentOrientation, onModeChange]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  }, []);

  // Handle forced rotation
  const forceRotation = useCallback(() => {
    const newOrientation = currentOrientation === 'portrait' ? 'landscape' : 'portrait';
    setForcedOrientation(newOrientation);
    setMode('locked');
    onModeChange?.('locked');
  }, [currentOrientation, onModeChange]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Screen lock API support (if available)
  const lockOrientation = useCallback(async (orientation: 'portrait' | 'landscape') => {
    if ('screen' in window && 'orientation' in window.screen && 'lock' in window.screen.orientation) {
      try {
        const lockType = orientation === 'portrait' ? 'portrait-primary' : 'landscape-primary';
        await (window.screen.orientation as any).lock(lockType);
      } catch (error) {
        console.log('Screen orientation lock not supported or failed:', error);
      }
    }
  }, []);

  const unlockOrientation = useCallback(async () => {
    if ('screen' in window && 'orientation' in window.screen && 'unlock' in window.screen.orientation) {
      try {
        await (window.screen.orientation as any).unlock();
      } catch (error) {
        console.log('Screen orientation unlock not supported or failed:', error);
      }
    }
  }, []);

  // Apply orientation lock when mode changes
  useEffect(() => {
    if (mode === 'locked' && forcedOrientation) {
      lockOrientation(forcedOrientation);
    } else if (mode === 'auto') {
      unlockOrientation();
    }
  }, [mode, forcedOrientation, lockOrientation, unlockOrientation]);

  // Get transition classes
  const getTransitionClasses = () => {
    if (layout.transition === 'none' || !isTransitioning) return '';
    
    const baseClasses = `transition-all duration-${transitionDuration}`;
    
    switch (layout.transition) {
      case 'fade':
        return `${baseClasses} ${isTransitioning ? 'opacity-0' : 'opacity-100'}`;
      case 'slide':
        return `${baseClasses} transform ${isTransitioning ? 'translate-x-4 opacity-75' : 'translate-x-0 opacity-100'}`;
      default:
        return baseClasses;
    }
  };

  // Mode selector component
  const ModeSelector: React.FC = () => (
    <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 min-w-40">
      <div className="p-2 space-y-1">
        {[
          { mode: 'auto' as OrientationMode, label: 'Auto', icon: <RotateCcw size={16} /> },
          { mode: 'portrait' as OrientationMode, label: 'Portrait', icon: <div className="w-3 h-4 border border-current rounded-sm" /> },
          { mode: 'landscape' as OrientationMode, label: 'Landscape', icon: <div className="w-4 h-3 border border-current rounded-sm" /> },
          { mode: 'locked' as OrientationMode, label: 'Lock Current', icon: <Lock size={16} /> },
        ].map((option) => (
          <button
            key={option.mode}
            onClick={() => handleModeChange(option.mode)}
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2 text-sm rounded',
              'text-left transition-colors duration-200',
              mode === option.mode
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            )}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Control panel component
  const ControlPanel: React.FC = () => (
    <div className={cn(
      'absolute z-40 flex items-center gap-2',
      controlPosition === 'top-left' && 'top-4 left-4',
      controlPosition === 'top-right' && 'top-4 right-4',
      controlPosition === 'bottom-left' && 'bottom-4 left-4',
      controlPosition === 'bottom-right' && 'bottom-4 right-4'
    )}>
      {/* Mode control */}
      {layout.lockable !== false && (
        <div className="relative">
          <TouchButton
            variant="ghost"
            size="sm"
            onClick={() => setShowModeSelector(!showModeSelector)}
            className="bg-gray-800/80 backdrop-blur-sm border border-gray-600"
            title={`Orientation: ${mode}`}
          >
            {mode === 'locked' ? <Lock size={16} /> : <RotateCcw size={16} />}
          </TouchButton>
          
          {showModeSelector && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowModeSelector(false)}
              />
              <ModeSelector />
            </>
          )}
        </div>
      )}

      {/* Force rotation */}
      <TouchButton
        variant="ghost"
        size="sm"
        onClick={forceRotation}
        className="bg-gray-800/80 backdrop-blur-sm border border-gray-600"
        title="Force rotation"
      >
        <RotateCcw size={16} className="transform rotate-90" />
      </TouchButton>

      {/* Fullscreen toggle */}
      {enableFullscreen && (
        <TouchButton
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
          className="bg-gray-800/80 backdrop-blur-sm border border-gray-600"
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </TouchButton>
      )}
    </div>
  );

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Control panel */}
      {showControls && <ControlPanel />}

      {/* Content container */}
      <div className={cn(
        'w-full h-full',
        getTransitionClasses(),
        isTransitioning && 'pointer-events-none'
      )}>
        {currentOrientation === 'portrait' ? layout.portrait : layout.landscape}
      </div>

      {/* Orientation indicator */}
      {isTransitioning && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-30">
          <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
            <RotateCcw size={24} className="animate-spin text-blue-400" />
            <span className="text-white font-medium">
              Switching to {currentOrientation} mode...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for using orientation adapter
export const useOrientationAdapter = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [mode, setMode] = useState<OrientationMode>('auto');

  return {
    orientation,
    mode,
    setOrientation,
    setMode,
  };
};

export default OrientationAdapter;
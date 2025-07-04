import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, XOctagon, RotateCcw } from 'lucide-react';
import { cn } from '../shared/utils';

export interface EmergencyStopProps {
  onStop: () => void | Promise<void>
  onReset?: () => void
  isEmergencyStopped?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showWarning?: boolean
  confirmationRequired?: boolean
  className?: string
}

export const EmergencyStop: React.FC<EmergencyStopProps> = ({
  onStop,
  onReset,
  isEmergencyStopped = false,
  size = 'lg',
  showWarning = true,
  confirmationRequired = false,
  className,
}) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const sizeConfig = {
    sm: {
      button: 'h-16 w-16',
      icon: 'h-8 w-8',
      text: 'text-xs',
      ring: 'ring-4',
      activeScale: 0.95,
    },
    md: {
      button: 'h-24 w-24',
      icon: 'h-12 w-12',
      text: 'text-sm',
      ring: 'ring-6',
      activeScale: 0.93,
    },
    lg: {
      button: 'h-32 w-32',
      icon: 'h-16 w-16',
      text: 'text-base',
      ring: 'ring-8',
      activeScale: 0.90,
    },
    xl: {
      button: 'h-40 w-40',
      icon: 'h-20 w-20',
      text: 'text-lg',
      ring: 'ring-8',
      activeScale: 0.88,
    },
  };

  const config = sizeConfig[size];

  const handleStop = async () => {
    if (confirmationRequired && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsProcessing(true);
    setIsPressed(true);

    try {
      await onStop();
    } finally {
      setIsProcessing(false);
      setShowConfirmation(false);
    }
  };

  const handleReset = () => {
    setIsPressed(false);
    onReset?.();
  };

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Warning text */}
      {showWarning && !isEmergencyStopped && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
        >
          <div className="flex items-center gap-1 text-red-500">
            <AlertTriangle className="h-4 w-4" />
            <span className={cn('font-semibold uppercase', config.text)}>
              Emergency Stop
            </span>
          </div>
        </motion.div>
      )}

      {/* Main button */}
      <motion.button
        whileTap={{ scale: config.activeScale }}
        onClick={handleStop}
        disabled={isEmergencyStopped || isProcessing}
        className={cn(
          'relative rounded-full flex items-center justify-center font-bold text-white shadow-2xl transition-all duration-150',
          config.button,
          config.ring,
          isEmergencyStopped
            ? 'bg-red-800 ring-red-900 cursor-not-allowed'
            : isPressed
              ? 'bg-red-700 ring-red-800 ring-offset-4 ring-offset-red-100'
              : 'bg-red-600 ring-red-700 hover:bg-red-700 active:bg-red-800',
          'focus:outline-none focus:ring-offset-8',
        )}
      >
        {/* Button inner shadow for 3D effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent" />

        {/* Icon */}
        <XOctagon className={cn(config.icon, 'relative z-10')} />

        {/* Processing spinner */}
        {isProcessing && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-3/4 h-3/4 rounded-full border-4 border-white/30 border-t-white"
            />
          </div>
        )}
      </motion.button>

      {/* Stop indicator */}
      {isEmergencyStopped && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2"
        >
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap">
            STOPPED - Press Reset
          </div>
        </motion.div>
      )}

      {/* Reset button */}
      {isEmergencyStopped && onReset && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleReset}
          className="absolute -right-16 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg"
        >
          <RotateCcw className="h-5 w-5" />
        </motion.button>
      )}

      {/* Confirmation dialog */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl p-4 border border-red-200 z-50"
          >
            <p className="text-sm font-medium mb-3 whitespace-nowrap">
              Confirm Emergency Stop?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleStop}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium"
              >
                Stop Now
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export interface CompactEmergencyStopProps {
  onStop: () => void
  isEmergencyStopped?: boolean
  className?: string
}

export const CompactEmergencyStop: React.FC<CompactEmergencyStopProps> = ({
  onStop,
  isEmergencyStopped = false,
  className,
}) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onStop}
      disabled={isEmergencyStopped}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white shadow-lg transition-all duration-150',
        isEmergencyStopped
          ? 'bg-red-800 cursor-not-allowed opacity-75'
          : 'bg-red-600 hover:bg-red-700 active:bg-red-800',
        'focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2',
        className,
      )}
    >
      <XOctagon className="h-5 w-5" />
      <span className="uppercase text-sm">
        {isEmergencyStopped ? 'Stopped' : 'E-Stop'}
      </span>
    </motion.button>
);

export interface SafetyControlPanelProps {
  onEmergencyStop: () => void
  onPause?: () => void
  onResume?: () => void
  isPaused?: boolean
  isEmergencyStopped?: boolean
  className?: string
}

export const SafetyControlPanel: React.FC<SafetyControlPanelProps> = ({
  onEmergencyStop,
  onPause,
  onResume,
  isPaused = false,
  isEmergencyStopped = false,
  className,
}) => (
    <div className={cn(
      'bg-card border border-border rounded-lg p-6 shadow-sm',
      className,
    )}>
      <h3 className="text-lg font-semibold text-card-foreground mb-4 text-center">
        Safety Controls
      </h3>

      <div className="flex flex-col items-center gap-4">
        <EmergencyStop
          onStop={onEmergencyStop}
          isEmergencyStopped={isEmergencyStopped}
          size="sm"
        />

        {(onPause || onResume) && (
          <div className="flex gap-2">
            {onPause && !isPaused && !isEmergencyStopped && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onPause}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium shadow-md"
              >
                Pause
              </motion.button>
            )}

            {onResume && isPaused && !isEmergencyStopped && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onResume}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium shadow-md"
              >
                Resume
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
);

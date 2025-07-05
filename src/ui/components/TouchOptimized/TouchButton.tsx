/**
 * TouchButton Component
 * 
 * Touch-optimized button component designed for industrial tablet and
 * mobile interfaces. Features larger touch targets, haptic feedback,
 * and enhanced visual feedback for industrial environments.
 */

import React, { useCallback, useRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import { useResponsive, touchTargets } from '../../theme/responsive';

const touchButtonVariants = cva(
  [
    // Base styles
    'relative inline-flex items-center justify-center',
    'font-medium transition-all duration-200 ease-in-out',
    'border-2 rounded-lg select-none',
    'focus:outline-none focus:ring-4 focus:ring-offset-2',
    'active:scale-95 active:transition-transform active:duration-75',
    // Touch feedback
    'touch-manipulation',
    // Accessibility
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-blue-600 border-blue-600 text-white',
          'hover:bg-blue-700 hover:border-blue-700',
          'active:bg-blue-800 active:border-blue-800',
          'focus:ring-blue-500/50',
        ],
        secondary: [
          'bg-gray-700 border-gray-600 text-gray-100',
          'hover:bg-gray-600 hover:border-gray-500',
          'active:bg-gray-800 active:border-gray-700',
          'focus:ring-gray-500/50',
        ],
        emergency: [
          'bg-red-600 border-red-600 text-white',
          'hover:bg-red-700 hover:border-red-700',
          'active:bg-red-800 active:border-red-800',
          'focus:ring-red-500/50',
          'shadow-lg shadow-red-500/25',
        ],
        success: [
          'bg-green-600 border-green-600 text-white',
          'hover:bg-green-700 hover:border-green-700',
          'active:bg-green-800 active:border-green-800',
          'focus:ring-green-500/50',
        ],
        warning: [
          'bg-yellow-600 border-yellow-600 text-white',
          'hover:bg-yellow-700 hover:border-yellow-700',
          'active:bg-yellow-800 active:border-yellow-800',
          'focus:ring-yellow-500/50',
        ],
        ghost: [
          'bg-transparent border-gray-600 text-gray-100',
          'hover:bg-gray-800 hover:border-gray-500',
          'active:bg-gray-900 active:border-gray-600',
          'focus:ring-gray-500/50',
        ],
      },
      size: {
        sm: 'text-sm px-4 py-2',
        md: 'text-base px-6 py-3',
        lg: 'text-lg px-8 py-4',
        xl: 'text-xl px-10 py-5',
        // Touch-optimized sizes
        touch: 'text-base px-6 py-4',
        'touch-lg': 'text-lg px-8 py-5',
        emergency: 'text-xl px-12 py-6',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      elevated: {
        true: 'shadow-lg hover:shadow-xl active:shadow-md',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      elevated: false,
    },
  }
);

export interface TouchButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
    VariantProps<typeof touchButtonVariants> {
  /** Button content */
  children: React.ReactNode;
  /** Icon to display before text */
  icon?: React.ReactNode;
  /** Icon to display after text */
  endIcon?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Enable haptic feedback on supported devices */
  hapticFeedback?: boolean;
  /** Custom minimum touch target size */
  minTouchTarget?: number;
  /** Show press animation */
  showPressAnimation?: boolean;
  /** Delay before action (prevents accidental activation) */
  activationDelay?: number;
}

export const TouchButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  (
    {
      className,
      variant,
      size = 'md',
      fullWidth,
      elevated,
      children,
      icon,
      endIcon,
      loading = false,
      hapticFeedback = true,
      minTouchTarget,
      showPressAnimation = true,
      activationDelay = 0,
      disabled,
      onClick,
      onTouchStart,
      onTouchEnd,
      ...props
    },
    ref
  ) => {
    const { isTouchDevice, breakpoint } = useResponsive();
    const [isPressed, setIsPressed] = useState(false);
    const [isActivating, setIsActivating] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();
    const touchStartRef = useRef<number>(0);

    // Determine appropriate size for touch devices
    const effectiveSize = React.useMemo(() => {
      if (!isTouchDevice) return size;
      
      // Auto-upgrade to touch-friendly sizes on touch devices
      const touchSizeMap: Record<string, string> = {
        sm: 'touch',
        md: 'touch',
        lg: 'touch-lg',
        xl: 'touch-lg',
      };
      
      return touchSizeMap[size || 'md'] || size;
    }, [size, isTouchDevice]);

    // Calculate minimum touch target
    const touchTargetSize = React.useMemo(() => {
      if (minTouchTarget) return minTouchTarget;
      
      if (variant === 'emergency') return touchTargets.emergency;
      if (effectiveSize === 'touch-lg' || effectiveSize === 'xl') return touchTargets.large;
      if (isTouchDevice) return touchTargets.recommended;
      
      return touchTargets.min;
    }, [minTouchTarget, variant, effectiveSize, isTouchDevice]);

    // Haptic feedback for supported devices
    const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'medium') => {
      if (!hapticFeedback || typeof navigator === 'undefined') return;
      
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [50],
          heavy: [100],
        };
        navigator.vibrate(patterns[type]);
      }
      
      // iOS haptic feedback (if available)
      if ('hapticFeedback' in navigator) {
        (navigator as any).hapticFeedback?.(type);
      }
    }, [hapticFeedback]);

    // Enhanced touch handling
    const handleTouchStart = useCallback(
      (event: React.TouchEvent<HTMLButtonElement>) => {
        if (disabled || loading) return;
        
        touchStartRef.current = Date.now();
        setIsPressed(true);
        
        if (showPressAnimation) {
          triggerHapticFeedback('light');
        }
        
        onTouchStart?.(event);
      },
      [disabled, loading, showPressAnimation, triggerHapticFeedback, onTouchStart]
    );

    const handleTouchEnd = useCallback(
      (event: React.TouchEvent<HTMLButtonElement>) => {
        setIsPressed(false);
        
        const touchDuration = Date.now() - touchStartRef.current;
        const isValidTouch = touchDuration >= 50; // Prevent accidental taps
        
        if (isValidTouch && !disabled && !loading) {
          if (activationDelay > 0) {
            setIsActivating(true);
            triggerHapticFeedback('medium');
            
            timeoutRef.current = setTimeout(() => {
              setIsActivating(false);
              triggerHapticFeedback('heavy');
              onClick?.(event as any);
            }, activationDelay);
          } else {
            triggerHapticFeedback('medium');
            onClick?.(event as any);
          }
        }
        
        onTouchEnd?.(event);
      },
      [activationDelay, disabled, loading, onClick, onTouchEnd, triggerHapticFeedback]
    );

    // Enhanced click handling for non-touch devices
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading || isTouchDevice) return;
        
        if (activationDelay > 0) {
          setIsActivating(true);
          
          timeoutRef.current = setTimeout(() => {
            setIsActivating(false);
            onClick?.(event);
          }, activationDelay);
        } else {
          onClick?.(event);
        }
      },
      [activationDelay, disabled, loading, isTouchDevice, onClick]
    );

    // Cleanup timeout on unmount
    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    // Cancel activation on escape key
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isActivating) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          setIsActivating(false);
        }
      };

      if (isActivating) {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }
    }, [isActivating]);

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    // Activation progress indicator for delayed actions
    const ActivationProgress = () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-1 bg-black/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white/80 rounded-full animate-pulse"
            style={{
              animation: `progress ${activationDelay}ms linear forwards`,
            }}
          />
        </div>
      </div>
    );

    return (
      <button
        ref={ref}
        className={cn(
          touchButtonVariants({ variant, size: effectiveSize as any, fullWidth, elevated }),
          className
        )}
        style={{
          minHeight: touchTargetSize,
          minWidth: touchTargetSize,
          ...(isPressed && showPressAnimation && {
            transform: 'scale(0.95)',
          }),
        }}
        disabled={disabled || loading || isActivating}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={typeof children === 'string' ? children : undefined}
        aria-disabled={disabled || loading || isActivating}
        {...props}
      >
        {/* Loading state */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner />
          </span>
        )}
        
        {/* Activation progress */}
        {isActivating && activationDelay > 0 && <ActivationProgress />}
        
        {/* Button content */}
        <span
          className={cn(
            'flex items-center justify-center gap-2',
            (loading || isActivating) && 'opacity-0'
          )}
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
          {endIcon && <span className="flex-shrink-0">{endIcon}</span>}
        </span>
        
        {/* Press feedback overlay */}
        {isPressed && showPressAnimation && (
          <span className="absolute inset-0 bg-white/10 rounded-lg animate-pulse" />
        )}
      </button>
    );
  }
);

TouchButton.displayName = 'TouchButton';

// CSS keyframes for progress animation
const progressKeyframes = `
@keyframes progress {
  from { width: 0%; }
  to { width: 100%; }
}
`;

// Inject keyframes into document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = progressKeyframes;
  document.head.appendChild(style);
}
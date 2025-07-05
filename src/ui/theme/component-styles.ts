/**
 * Component Style System
 * 
 * Uses class-variance-authority (CVA) to create reusable component variants
 * that work across different component implementations (Ant Design, Headless UI, Custom)
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { designTokens } from './tokens';

// ============================================================================
// BUTTON VARIANTS
// ============================================================================

export const buttonVariants = cva(
  // Base styles - applied to all button variants
  [
    'inline-flex items-center justify-center rounded-md font-medium',
    'ring-offset-background transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer select-none',
    'active:scale-95 transition-transform duration-150',
  ],
  {
    variants: {
      variant: {
        // Primary variant - main brand color
        primary: [
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90 active:bg-primary/95',
          'shadow-sm hover:shadow-md',
          'border border-primary',
        ],
        
        // Secondary variant - subtle styling
        secondary: [
          'bg-secondary text-secondary-foreground', 
          'hover:bg-secondary/80 active:bg-secondary/90',
          'border border-input shadow-sm',
        ],
        
        // Destructive variant - danger actions
        destructive: [
          'bg-destructive text-destructive-foreground',
          'hover:bg-destructive/90 active:bg-destructive/95',
          'border border-destructive shadow-sm',
        ],
        
        // Outline variant - bordered button
        outline: [
          'border border-input bg-background',
          'hover:bg-accent hover:text-accent-foreground',
          'active:bg-accent/90',
        ],
        
        // Ghost variant - minimal styling
        ghost: [
          'hover:bg-accent hover:text-accent-foreground',
          'active:bg-accent/90',
        ],
        
        // Link variant - text-like button
        link: [
          'text-primary underline-offset-4',
          'hover:underline active:underline',
        ],

        // CNC-specific variants
        emergency: [
          'bg-red-600 text-white border-2 border-red-500',
          'hover:bg-red-700 active:bg-red-800',
          'shadow-lg hover:shadow-xl',
          'ring-2 ring-red-500/20',
        ],
        
        success: [
          'bg-green-600 text-white',
          'hover:bg-green-700 active:bg-green-800',
          'border border-green-500 shadow-sm',
        ],
        
        warning: [
          'bg-amber-600 text-white',
          'hover:bg-amber-700 active:bg-amber-800', 
          'border border-amber-500 shadow-sm',
        ],
      },
      
      size: {
        sm: 'h-8 rounded-md px-3 text-sm',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-lg',
        icon: 'h-10 w-10',
        
        // CNC-specific sizes
        jog: 'h-12 w-12 rounded-lg text-lg font-bold',
        emergency: 'h-16 w-16 rounded-full text-sm font-bold',
      },
      
      loading: {
        true: 'cursor-wait opacity-70',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      loading: false,
    },
  }
);

// ============================================================================
// CARD VARIANTS
// ============================================================================

export const cardVariants = cva(
  [
    'rounded-lg border bg-card text-card-foreground',
    'transition-all duration-200',
  ],
  {
    variants: {
      variant: {
        default: 'shadow-sm',
        elevated: 'shadow-md',
        outlined: 'border-2',
        filled: 'bg-muted/50',
        cnc: 'border-primary/20 bg-card/95 backdrop-blur-sm',
      },
      
      size: {
        sm: 'p-4',
        md: 'p-6', 
        lg: 'p-8',
        xl: 'p-10',
      },
      
      hoverable: {
        true: 'hover:shadow-lg hover:scale-[1.02] cursor-pointer',
        false: '',
      },
      
      interactive: {
        true: 'hover:border-primary/40 active:scale-[0.98]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      hoverable: false,
      interactive: false,
    },
  }
);

// ============================================================================
// BADGE VARIANTS
// ============================================================================

export const badgeVariants = cva(
  [
    'inline-flex items-center rounded-full border px-2.5 py-0.5',
    'text-xs font-semibold transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  ],
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        
        // Status variants for CNC
        success: 'border-transparent bg-green-500/20 text-green-300 border-green-500/30',
        warning: 'border-transparent bg-amber-500/20 text-amber-300 border-amber-500/30',
        danger: 'border-transparent bg-red-500/20 text-red-300 border-red-500/30',
        info: 'border-transparent bg-blue-500/20 text-blue-300 border-blue-500/30',
        
        // CNC status specific
        connected: 'border-transparent bg-green-500/20 text-green-300 animate-pulse',
        disconnected: 'border-transparent bg-red-500/20 text-red-300',
        running: 'border-transparent bg-blue-500/20 text-blue-300 animate-pulse',
        idle: 'border-transparent bg-amber-500/20 text-amber-300',
      },
      
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
      },
      
      shape: {
        default: 'rounded-full',
        rounded: 'rounded-md',
        square: 'rounded-none',
      },
      
      dot: {
        true: 'w-2 h-2 p-0 rounded-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md', 
      shape: 'default',
      dot: false,
    },
  }
);

// ============================================================================
// INPUT VARIANTS
// ============================================================================

export const inputVariants = cva(
  [
    'flex w-full rounded-md border border-input bg-background',
    'text-sm ring-offset-background file:border-0 file:bg-transparent',
    'file:text-sm file:font-medium placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-colors duration-200',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-3 py-1 text-sm',
        md: 'h-10 px-3 py-2',
        lg: 'h-12 px-4 py-3 text-base',
      },
      
      variant: {
        default: '',
        filled: 'bg-muted border-transparent',
        flushed: 'rounded-none border-x-0 border-t-0 border-b-2 px-0',
        
        // CNC-specific variants
        coordinate: [
          'font-mono text-center font-semibold',
          'bg-secondary/50 border-primary/30',
          'focus:bg-secondary/80 focus:border-primary',
        ],
        precision: [
          'font-mono text-right tabular-nums',
          'bg-muted/50 border-muted',
        ],
      },
      
      state: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-green-500 focus-visible:ring-green-500',
        warning: 'border-amber-500 focus-visible:ring-amber-500',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      state: 'default',
    },
  }
);

// ============================================================================
// ALERT VARIANTS  
// ============================================================================

export const alertVariants = cva(
  [
    'relative w-full rounded-lg border p-4',
    'transition-all duration-200',
  ],
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive: [
          'border-destructive/50 text-destructive dark:border-destructive',
          'bg-destructive/10',
        ],
        success: [
          'border-green-500/50 text-green-600 dark:border-green-500',
          'bg-green-500/10',
        ],
        warning: [
          'border-amber-500/50 text-amber-600 dark:border-amber-500', 
          'bg-amber-500/10',
        ],
        info: [
          'border-blue-500/50 text-blue-600 dark:border-blue-500',
          'bg-blue-500/10',
        ],
      },
      
      size: {
        sm: 'p-3 text-sm',
        md: 'p-4',
        lg: 'p-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// ============================================================================
// CNC-SPECIFIC COMPONENT VARIANTS
// ============================================================================

// Status Indicator Variants
export const statusIndicatorVariants = cva(
  [
    'flex items-center gap-2 rounded-md px-3 py-2',
    'text-sm font-medium transition-all duration-200',
  ],
  {
    variants: {
      status: {
        connected: 'bg-green-500/20 text-green-300 border border-green-500/30',
        disconnected: 'bg-red-500/20 text-red-300 border border-red-500/30',
        idle: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        running: 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse',
        error: 'bg-red-600/20 text-red-300 border border-red-600/30',
        warning: 'bg-amber-600/20 text-amber-300 border border-amber-600/30',
      },
      
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
      },
      
      interactive: {
        true: 'cursor-pointer hover:scale-105 active:scale-95',
        false: 'cursor-default',
      },
    },
    defaultVariants: {
      status: 'disconnected',
      size: 'md',
      interactive: false,
    },
  }
);

// Coordinate Display Variants
export const coordinateDisplayVariants = cva(
  [
    'font-mono text-center tabular-nums',
    'rounded-md border transition-all duration-200',
  ],
  {
    variants: {
      axis: {
        x: 'border-red-500/30 bg-red-500/10 text-red-300',
        y: 'border-green-500/30 bg-green-500/10 text-green-300', 
        z: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
        combined: 'border-primary/30 bg-primary/10 text-primary-foreground',
      },
      
      size: {
        sm: 'px-2 py-1 text-sm',
        md: 'px-3 py-2 text-lg',
        lg: 'px-4 py-3 text-xl',
        xl: 'px-6 py-4 text-2xl',
      },
      
      precision: {
        low: 'opacity-70',
        medium: 'opacity-85',
        high: 'opacity-100 font-semibold',
      },
    },
    defaultVariants: {
      axis: 'combined',
      size: 'md',
      precision: 'high',
    },
  }
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Export variant prop types for TypeScript
export type ButtonVariants = VariantProps<typeof buttonVariants>;
export type CardVariants = VariantProps<typeof cardVariants>;
export type BadgeVariants = VariantProps<typeof badgeVariants>;
export type InputVariants = VariantProps<typeof inputVariants>;
export type AlertVariants = VariantProps<typeof alertVariants>;
export type StatusIndicatorVariants = VariantProps<typeof statusIndicatorVariants>;
export type CoordinateDisplayVariants = VariantProps<typeof coordinateDisplayVariants>;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Utility to combine variant classes with custom classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get component variants for a specific component type
 */
export const componentVariants = {
  button: buttonVariants,
  card: cardVariants,
  badge: badgeVariants,
  input: inputVariants,
  alert: alertVariants,
  statusIndicator: statusIndicatorVariants,
  coordinateDisplay: coordinateDisplayVariants,
} as const;

export type ComponentType = keyof typeof componentVariants;
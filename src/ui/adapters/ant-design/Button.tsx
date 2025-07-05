/**
 * Ant Design Button Adapter
 * 
 * Maps our stable ButtonProps interface to Ant Design's Button component.
 * This adapter allows us to use Ant Design while maintaining a consistent API
 * that can be swapped for other implementations in the future.
 */

import React from 'react';
import { Button as AntButton } from 'antd';
import { ButtonProps as AntButtonProps } from 'antd/es/button';
import { buttonVariants } from '../../theme/component-styles';
import { ButtonProps } from '../../interfaces';
import { cn } from '../../shared/utils';

// ============================================================================
// TYPE MAPPINGS
// ============================================================================

/**
 * Maps our variant types to Ant Design button types
 */
const variantToAntType: Record<NonNullable<ButtonProps['variant']>, AntButtonProps['type']> = {
  primary: 'primary',
  secondary: 'default',
  destructive: 'primary', // We'll use danger prop for this
  outline: 'default',
  ghost: 'ghost',
  link: 'link',
  // CNC-specific variants map to primary with custom styling
  emergency: 'primary',
  success: 'primary',
  warning: 'primary',
};

/**
 * Maps our size types to Ant Design sizes
 */
const sizeToAntSize: Record<NonNullable<ButtonProps['size']>, AntButtonProps['size']> = {
  sm: 'small',
  md: 'middle',
  lg: 'large',
  xl: 'large', // Ant doesn't have xl, we'll use CSS for this
  icon: 'middle',
  // CNC-specific sizes
  jog: 'large',
  emergency: 'large',
};

/**
 * Variants that should use Ant Design's danger prop
 */
const dangerVariants: ButtonProps['variant'][] = ['destructive', 'emergency'];

/**
 * Variants that need custom CSS styling beyond Ant Design
 */
const customStyledVariants: ButtonProps['variant'][] = [
  'emergency', 'success', 'warning', 'outline'
];

// ============================================================================
// BUTTON ADAPTER COMPONENT
// ============================================================================

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  className,
  children,
  startIcon,
  endIcon,
  fullWidth,
  onClick,
  ...rest
}, ref) => {
  
  // Map our props to Ant Design props
  const antType = variantToAntType[variant];
  const antSize = sizeToAntSize[size];
  const isDanger = dangerVariants.includes(variant);
  const needsCustomStyling = customStyledVariants.includes(variant);

  // Generate CSS classes for custom styling
  const customClasses = needsCustomStyling ? buttonVariants({
    variant,
    size,
    loading: loading ? true : false,
  }) : '';

  // Combine our custom classes with any passed className
  const finalClassName = cn(
    needsCustomStyling && customClasses,
    fullWidth && 'w-full',
    className
  );

  // Handle icons - Ant Design expects icon prop, we support start/end icons
  const icon = startIcon || undefined;

  return (
    <AntButton
      ref={ref}
      type={antType}
      size={antSize}
      danger={isDanger}
      loading={loading}
      disabled={disabled}
      htmlType={type}
      className={finalClassName}
      icon={icon}
      onClick={onClick}
      block={fullWidth}
      {...rest}
    >
      {children}
      {endIcon && <span style={{ marginLeft: '0.5rem' }}>{endIcon}</span>}
    </AntButton>
  );
});

Button.displayName = 'Button';

// ============================================================================
// ADDITIONAL BUTTON VARIANTS
// ============================================================================

/**
 * Emergency stop button with enhanced styling and safety features
 */
export const EmergencyButton = React.forwardRef<HTMLButtonElement, 
  Omit<ButtonProps, 'variant'> & {
    onEmergencyStop?: () => void;
    confirmRequired?: boolean;
  }
>(({
  onEmergencyStop,
  confirmRequired = true,
  onClick,
  children = 'EMERGENCY STOP',
  size = 'emergency',
  ...props
}, ref) => {
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (confirmRequired) {
      const confirmed = window.confirm(
        'Are you sure you want to activate emergency stop?\n\nThis will immediately halt all machine operations.'
      );
      if (!confirmed) return;
    }
    
    onEmergencyStop?.();
    onClick?.(event);
  };

  return (
    <Button
      ref={ref}
      variant="emergency"
      size={size}
      onClick={handleClick}
      className="animate-pulse"
      {...props}
    >
      {children}
    </Button>
  );
});

EmergencyButton.displayName = 'EmergencyButton';

/**
 * Jog control button for CNC machine movement
 */
export const JogButton = React.forwardRef<HTMLButtonElement,
  Omit<ButtonProps, 'variant' | 'size'> & {
    axis?: 'X' | 'Y' | 'Z';
    direction?: 'positive' | 'negative';
    onJog?: (axis: string, direction: number) => void;
  }
>(({
  axis = 'X',
  direction = 'positive',
  onJog,
  onClick,
  children,
  ...props
}, ref) => {
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const directionValue = direction === 'positive' ? 1 : -1;
    onJog?.(axis, directionValue);
    onClick?.(event);
  };

  // Generate appropriate arrow or label
  const getButtonContent = () => {
    if (children) return children;
    
    const arrows = {
      X: { positive: '→', negative: '←' },
      Y: { positive: '↑', negative: '↓' },
      Z: { positive: '⬆', negative: '⬇' },
    };
    
    return arrows[axis][direction];
  };

  return (
    <Button
      ref={ref}
      variant="primary"
      size="jog"
      onClick={handleClick}
      className="font-mono font-bold"
      {...props}
    >
      {getButtonContent()}
    </Button>
  );
});

JogButton.displayName = 'JogButton';

// ============================================================================
// BUTTON GROUP COMPONENT
// ============================================================================

/**
 * Button group for related actions
 */
export interface ButtonGroupProps {
  children: React.ReactNode;
  size?: ButtonProps['size'];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  className,
}) => {
  const groupClasses = cn(
    'inline-flex',
    orientation === 'horizontal' ? 'flex-row' : 'flex-col',
    '[&>*:not(:first-child)]:ml-0 [&>*:not(:first-child)]:border-l-0',
    '[&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none',
    '[&>*:not(:first-child):not(:last-child)]:rounded-none',
    className
  );

  return (
    <div className={groupClasses} role="group">
      {children}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Button;
export type { ButtonProps } from '../../interfaces';
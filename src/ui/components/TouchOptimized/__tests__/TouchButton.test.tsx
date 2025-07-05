/**
 * TouchButton Component Tests
 * 
 * Comprehensive test suite for touch-optimized button component,
 * including touch events, haptic feedback, accessibility, and
 * mobile-specific behaviors.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TouchButton } from '../TouchButton';
import {
  TouchEventSimulator,
  ResponsiveTestUtils,
  AccessibilityTestUtils,
  mobileAssertions,
  mockAPIs,
  renderWithMobileContext,
  defaultMobileContext,
  tabletContext,
  desktopContext,
} from '../../testing/mobile-test-utils';

// Mock the responsive hook
jest.mock('@/ui/theme/responsive', () => ({
  useResponsive: () => ({
    breakpoint: 'md',
    orientation: 'portrait',
    isTouchDevice: true,
  }),
  touchTargets: {
    min: 44,
    recommended: 64,
    large: 80,
    emergency: 120,
  },
}));

describe('TouchButton Component', () => {
  beforeEach(() => {
    ResponsiveTestUtils.setupMobileEnvironment(defaultMobileContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<TouchButton>Test Button</TouchButton>);
      
      const button = screen.getByRole('button', { name: /test button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('touch-manipulation');
    });

    it('renders with different variants', () => {
      const variants = ['primary', 'secondary', 'ghost', 'warning', 'error'] as const;
      
      variants.forEach((variant) => {
        const { rerender } = render(<TouchButton variant={variant}>Test</TouchButton>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass(expect.stringContaining(variant));
        rerender(<></>);
      });
    });

    it('renders with different sizes', () => {
      const sizes = ['sm', 'md', 'lg', 'touch', 'touch-lg'] as const;
      
      sizes.forEach((size) => {
        const { rerender } = render(<TouchButton size={size}>Test</TouchButton>);
        const button = screen.getByRole('button');
        
        // Check minimum touch target size for touch sizes
        if (size.includes('touch')) {
          const rect = button.getBoundingClientRect();
          expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
        }
        
        rerender(<></>);
      });
    });

    it('renders with icon and text', () => {
      const TestIcon = () => <span data-testid="test-icon">🏠</span>;
      
      render(
        <TouchButton icon={<TestIcon />}>
          Home
        </TouchButton>
      );
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('applies fullWidth prop correctly', () => {
      render(<TouchButton fullWidth>Full Width</TouchButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Touch Interactions', () => {
    it('handles touch events correctly', async () => {
      const handleClick = jest.fn();
      render(<TouchButton onClick={handleClick}>Touch Me</TouchButton>);
      
      const button = screen.getByRole('button');
      TouchEventSimulator.tap(button);
      
      await waitFor(() => {
        expect(handleClick).toHaveBeenCalledTimes(1);
      });
    });

    it('provides haptic feedback on touch', async () => {
      const mockVibrate = mockAPIs.vibration.setup();
      
      render(<TouchButton hapticFeedback>Haptic Button</TouchButton>);
      
      const button = screen.getByRole('button');
      TouchEventSimulator.tap(button);
      
      await waitFor(() => {
        expect(mockVibrate).toHaveBeenCalledWith(50);
      });
    });

    it('disables haptic feedback when prop is false', async () => {
      const mockVibrate = mockAPIs.vibration.setup();
      
      render(<TouchButton hapticFeedback={false}>No Haptic</TouchButton>);
      
      const button = screen.getByRole('button');
      TouchEventSimulator.tap(button);
      
      await waitFor(() => {
        expect(mockVibrate).not.toHaveBeenCalled();
      });
    });

    it('shows press animation', async () => {
      render(<TouchButton showPressAnimation>Animated Button</TouchButton>);
      
      const button = screen.getByRole('button');
      
      fireEvent.touchStart(button);
      expect(button).toHaveClass('active:scale-95');
      
      fireEvent.touchEnd(button);
    });

    it('handles long press events', async () => {
      const handleLongPress = jest.fn();
      
      render(
        <TouchButton
          onLongPress={handleLongPress}
          longPressDelay={500}
        >
          Long Press Me
        </TouchButton>
      );
      
      const button = screen.getByRole('button');
      
      await TouchEventSimulator.longPress(button, 600);
      
      await waitFor(() => {
        expect(handleLongPress).toHaveBeenCalledTimes(1);
      });
    });

    it('prevents default touch behaviors', () => {
      render(<TouchButton>Touch Button</TouchButton>);
      
      const button = screen.getByRole('button');
      const touchStartEvent = TouchEventSimulator.createTouchEvent('touchstart', [
        { clientX: 100, clientY: 100 }
      ]);
      
      const preventDefault = jest.spyOn(touchStartEvent, 'preventDefault');
      fireEvent(button, touchStartEvent);
      
      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <TouchButton
          aria-label="Custom Label"
          aria-describedby="description"
        >
          Button Text
        </TouchButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });

    it('meets minimum touch target size requirements', async () => {
      render(<TouchButton size="touch">Touch Target</TouchButton>);
      
      const button = screen.getByRole('button');
      await mobileAssertions.expectAccessibleTouchTarget(button);
    });

    it('handles disabled state correctly', () => {
      const handleClick = jest.fn();
      
      render(
        <TouchButton disabled onClick={handleClick}>
          Disabled Button
        </TouchButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
      
      TouchEventSimulator.tap(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('supports keyboard navigation', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(<TouchButton onClick={handleClick}>Keyboard Button</TouchButton>);
      
      const button = screen.getByRole('button');
      
      await user.tab();
      expect(button).toHaveFocus();
      
      await user.keyboard('[Enter]');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      await user.keyboard('[Space]');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('passes accessibility audit', async () => {
      const { container } = render(
        <TouchButton aria-label="Accessible Button">
          Click Me
        </TouchButton>
      );
      
      const issues = await AccessibilityTestUtils.checkAriaLabels(container);
      expect(issues).toHaveLength(0);
      
      const touchIssues = await AccessibilityTestUtils.checkTouchTargetSize(container);
      expect(touchIssues).toHaveLength(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to mobile viewport', () => {
      renderWithMobileContext(
        <TouchButton>Mobile Button</TouchButton>,
        { mobileContext: defaultMobileContext }
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('touch-manipulation');
    });

    it('adapts to tablet viewport', () => {
      renderWithMobileContext(
        <TouchButton>Tablet Button</TouchButton>,
        { mobileContext: tabletContext }
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('touch-manipulation');
    });

    it('adapts to desktop viewport', () => {
      renderWithMobileContext(
        <TouchButton>Desktop Button</TouchButton>,
        { mobileContext: desktopContext }
      );
      
      const button = screen.getByRole('button');
      // Should still support touch for desktop touch screens
      expect(button).toHaveClass('touch-manipulation');
    });

    it('adjusts size based on touch device detection', () => {
      ResponsiveTestUtils.mockTouchDevice(true);
      
      const { rerender } = render(<TouchButton>Touch Device</TouchButton>);
      const button = screen.getByRole('button');
      
      const touchRect = button.getBoundingClientRect();
      
      ResponsiveTestUtils.mockTouchDevice(false);
      rerender(<TouchButton>Non-Touch Device</TouchButton>);
      
      // Touch version should have larger minimum size
      expect(touchRect.height).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      render(
        <TouchButton loading loadingText="Loading...">
          Submit
        </TouchButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      
      // Should show loading indicator
      expect(button.querySelector('[data-loading]')).toBeInTheDocument();
    });

    it('disables interaction while loading', () => {
      const handleClick = jest.fn();
      
      render(
        <TouchButton loading onClick={handleClick}>
          Submit
        </TouchButton>
      );
      
      const button = screen.getByRole('button');
      TouchEventSimulator.tap(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(
        <TouchButton className="custom-class">
          Custom Styled
        </TouchButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('merges custom styles with default styles', () => {
      render(
        <TouchButton className="text-red-500" variant="primary">
          Red Primary
        </TouchButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-red-500');
      expect(button).toHaveClass('bg-blue-600'); // Primary variant color
    });
  });

  describe('Performance', () => {
    it('renders efficiently with multiple instances', () => {
      const startTime = performance.now();
      
      const buttons = Array.from({ length: 100 }, (_, i) => (
        <TouchButton key={i}>Button {i}</TouchButton>
      ));
      
      render(<div>{buttons}</div>);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render 100 buttons in under 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('handles rapid touch events efficiently', async () => {
      const handleClick = jest.fn();
      
      render(<TouchButton onClick={handleClick}>Rapid Touch</TouchButton>);
      
      const button = screen.getByRole('button');
      
      // Simulate rapid tapping
      for (let i = 0; i < 10; i++) {
        TouchEventSimulator.tap(button);
      }
      
      await waitFor(() => {
        expect(handleClick).toHaveBeenCalledTimes(10);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles missing children gracefully', () => {
      render(<TouchButton />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeEmptyDOMElement();
    });

    it('handles invalid size prop gracefully', () => {
      // @ts-ignore - Testing runtime behavior with invalid prop
      render(<TouchButton size="invalid">Invalid Size</TouchButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('prevents event propagation when specified', () => {
      const parentClick = jest.fn();
      const buttonClick = jest.fn();
      
      render(
        <div onClick={parentClick}>
          <TouchButton onClick={buttonClick} stopPropagation>
            Stop Propagation
          </TouchButton>
        </div>
      );
      
      const button = screen.getByRole('button');
      TouchEventSimulator.tap(button);
      
      expect(buttonClick).toHaveBeenCalledTimes(1);
      expect(parentClick).not.toHaveBeenCalled();
    });
  });
});
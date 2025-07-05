/**
 * TouchJogControls Component Tests
 * 
 * Comprehensive test suite for touch-optimized CNC jog controls,
 * including continuous jogging, gesture controls, boundary checking,
 * and industrial safety features.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TouchJogControls } from '../TouchJogControls';
import {
  TouchEventSimulator,
  ResponsiveTestUtils,
  AccessibilityTestUtils,
  mobileAssertions,
  mockAPIs,
  renderWithMobileContext,
  defaultMobileContext,
  tabletContext,
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

// Mock the TouchButton component
jest.mock('../TouchButton', () => ({
  TouchButton: ({ children, onClick, onTouchStart, onTouchEnd, onMouseDown, onMouseUp, onMouseLeave, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      data-testid={props['data-testid'] || 'touch-button'}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('TouchJogControls Component', () => {
  const defaultProps = {
    position: { x: 0, y: 0, z: 0 },
    stepSizes: [0.1, 1, 10, 100],
    selectedStepSize: 1,
    workingArea: {
      width: 300,
      height: 300,
      depth: 100,
      units: 'mm' as const,
    },
    onJog: jest.fn(),
    onHome: jest.fn(),
  };

  beforeEach(() => {
    ResponsiveTestUtils.setupMobileEnvironment(defaultMobileContext);
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<TouchJogControls {...defaultProps} />);
      
      // Check for main control sections
      expect(screen.getByText('Current Position')).toBeInTheDocument();
      expect(screen.getByText('Step Size')).toBeInTheDocument();
      expect(screen.getByText('XY Controls')).toBeInTheDocument();
      expect(screen.getByText('Z Controls')).toBeInTheDocument();
    });

    it('displays current position correctly', () => {
      const position = { x: 150.5, y: 75.25, z: 10.1 };
      render(<TouchJogControls {...defaultProps} position={position} />);
      
      expect(screen.getByText('150.50')).toBeInTheDocument();
      expect(screen.getByText('75.25')).toBeInTheDocument();
      expect(screen.getByText('10.10')).toBeInTheDocument();
    });

    it('shows working area units', () => {
      render(<TouchJogControls {...defaultProps} />);
      
      const unitElements = screen.getAllByText('mm');
      expect(unitElements.length).toBeGreaterThan(0);
    });

    it('renders step size options', () => {
      render(<TouchJogControls {...defaultProps} />);
      
      expect(screen.getByText('0.1 mm')).toBeInTheDocument();
      expect(screen.getByText('1 mm')).toBeInTheDocument();
      expect(screen.getByText('10 mm')).toBeInTheDocument();
      expect(screen.getByText('100 mm')).toBeInTheDocument();
    });

    it('renders in compact mode for small screens', () => {
      renderWithMobileContext(
        <TouchJogControls {...defaultProps} compact />,
        { mobileContext: { ...defaultMobileContext, breakpoint: 'xs' } }
      );
      
      // Compact mode should still render all essential controls
      expect(screen.getByText('XY Controls')).toBeInTheDocument();
      expect(screen.getByText('Z Controls')).toBeInTheDocument();
    });
  });

  describe('Jog Controls', () => {
    it('handles single jog operations', () => {
      const onJog = jest.fn();
      render(<TouchJogControls {...defaultProps} onJog={onJog} />);
      
      const xPlusButton = screen.getByText('X+');
      TouchEventSimulator.tap(xPlusButton);
      
      expect(onJog).toHaveBeenCalledWith('X', 1, 1);
    });

    it('handles different axis movements', () => {
      const onJog = jest.fn();
      render(<TouchJogControls {...defaultProps} onJog={onJog} />);
      
      // Test all axis directions
      const buttons = [
        { text: 'X+', axis: 'X', direction: 1 },
        { text: 'X-', axis: 'X', direction: -1 },
        { text: 'Y+', axis: 'Y', direction: 1 },
        { text: 'Y-', axis: 'Y', direction: -1 },
        { text: 'Z+', axis: 'Z', direction: 1 },
        { text: 'Z-', axis: 'Z', direction: -1 },
      ];

      buttons.forEach(({ text, axis, direction }) => {
        const button = screen.getByText(text);
        TouchEventSimulator.tap(button);
        expect(onJog).toHaveBeenCalledWith(axis, direction, 1);
      });
    });

    it('uses selected step size for movements', () => {
      const onJog = jest.fn();
      render(
        <TouchJogControls 
          {...defaultProps} 
          onJog={onJog}
          selectedStepSize={10}
        />
      );
      
      const xPlusButton = screen.getByText('X+');
      TouchEventSimulator.tap(xPlusButton);
      
      expect(onJog).toHaveBeenCalledWith('X', 1, 10);
    });

    it('updates step size when changed', () => {
      const onStepSizeChange = jest.fn();
      render(
        <TouchJogControls 
          {...defaultProps} 
          onStepSizeChange={onStepSizeChange}
        />
      );
      
      const stepButton = screen.getByText('10 mm');
      fireEvent.click(stepButton);
      
      expect(onStepSizeChange).toHaveBeenCalledWith(10);
    });
  });

  describe('Continuous Jogging', () => {
    it('starts continuous jog on long press', async () => {
      const onJog = jest.fn();
      render(
        <TouchJogControls 
          {...defaultProps} 
          onJog={onJog}
          enableContinuousJog
          continuousJogInterval={100}
        />
      );
      
      const xPlusButton = screen.getByText('X+');
      
      // Start long press
      fireEvent.touchStart(xPlusButton);
      
      // Fast forward past long press delay
      act(() => {
        jest.advanceTimersByTime(600);
      });
      
      // Should start continuous jogging
      act(() => {
        jest.advanceTimersByTime(200); // Two intervals
      });
      
      expect(onJog).toHaveBeenCalledTimes(2);
    });

    it('stops continuous jog on touch end', async () => {
      const onJog = jest.fn();
      render(
        <TouchJogControls 
          {...defaultProps} 
          onJog={onJog}
          enableContinuousJog
        />
      );
      
      const xPlusButton = screen.getByText('X+');
      
      // Start long press
      fireEvent.touchStart(xPlusButton);
      
      // Fast forward to start continuous jog
      act(() => {
        jest.advanceTimersByTime(600);
      });
      
      // End touch
      fireEvent.touchEnd(xPlusButton);
      
      // Clear any existing calls
      onJog.mockClear();
      
      // Should stop continuous jogging
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      expect(onJog).not.toHaveBeenCalled();
    });

    it('respects continuous jog interval', () => {
      const onJog = jest.fn();
      const interval = 200;
      
      render(
        <TouchJogControls 
          {...defaultProps} 
          onJog={onJog}
          enableContinuousJog
          continuousJogInterval={interval}
        />
      );
      
      const xPlusButton = screen.getByText('X+');
      
      fireEvent.touchStart(xPlusButton);
      
      // Start continuous jog
      act(() => {
        jest.advanceTimersByTime(600);
      });
      
      onJog.mockClear();
      
      // Advance by exactly one interval
      act(() => {
        jest.advanceTimersByTime(interval);
      });
      
      expect(onJog).toHaveBeenCalledTimes(1);
    });

    it('can disable continuous jogging', () => {
      const onJog = jest.fn();
      render(
        <TouchJogControls 
          {...defaultProps} 
          onJog={onJog}
          enableContinuousJog={false}
        />
      );
      
      const xPlusButton = screen.getByText('X+');
      
      fireEvent.touchStart(xPlusButton);
      
      // Wait longer than long press delay
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Should only have single jog, no continuous
      expect(onJog).toHaveBeenCalledTimes(0); // TouchStart doesn't trigger jog
      
      fireEvent.touchEnd(xPlusButton);
      expect(onJog).toHaveBeenCalledTimes(1); // Only on touch end
    });
  });

  describe('Boundary Checking', () => {
    it('prevents movement beyond working area boundaries', () => {
      const onJog = jest.fn();
      const position = { x: 300, y: 300, z: 100 }; // At maximum bounds
      
      render(
        <TouchJogControls 
          {...defaultProps} 
          position={position}
          onJog={onJog}
        />
      );
      
      // Try to move beyond positive bounds
      const xPlusButton = screen.getByText('X+');
      TouchEventSimulator.tap(xPlusButton);
      
      // Should not call onJog because it would exceed bounds
      expect(onJog).not.toHaveBeenCalled();
    });

    it('prevents movement below zero coordinates', () => {
      const onJog = jest.fn();
      const position = { x: 0, y: 0, z: 0 }; // At minimum bounds
      
      render(
        <TouchJogControls 
          {...defaultProps} 
          position={position}
          onJog={onJog}
        />
      );
      
      // Try to move below zero
      const xMinusButton = screen.getByText('X-');
      TouchEventSimulator.tap(xMinusButton);
      
      // Should not call onJog because it would go below zero
      expect(onJog).not.toHaveBeenCalled();
    });

    it('allows movement within boundaries', () => {
      const onJog = jest.fn();
      const position = { x: 150, y: 150, z: 50 }; // In middle of working area
      
      render(
        <TouchJogControls 
          {...defaultProps} 
          position={position}
          onJog={onJog}
        />
      );
      
      // Should allow movement in any direction
      const xPlusButton = screen.getByText('X+');
      TouchEventSimulator.tap(xPlusButton);
      
      expect(onJog).toHaveBeenCalledWith('X', 1, 1);
    });

    it('stops continuous jog when boundary is reached', () => {
      const onJog = jest.fn();
      let position = { x: 299, y: 150, z: 50 }; // Close to X boundary
      
      const { rerender } = render(
        <TouchJogControls 
          {...defaultProps} 
          position={position}
          onJog={onJog}
          enableContinuousJog
        />
      );
      
      const xPlusButton = screen.getByText('X+');
      
      fireEvent.touchStart(xPlusButton);
      
      // Start continuous jog
      act(() => {
        jest.advanceTimersByTime(600);
      });
      
      // Simulate reaching boundary by updating position
      position = { x: 300, y: 150, z: 50 };
      rerender(
        <TouchJogControls 
          {...defaultProps} 
          position={position}
          onJog={onJog}
          enableContinuousJog
        />
      );
      
      onJog.mockClear();
      
      // Should stop continuous jogging when boundary is reached
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      expect(onJog).not.toHaveBeenCalled();
    });
  });

  describe('Home Controls', () => {
    it('handles home all axes', () => {
      const onHome = jest.fn();
      render(<TouchJogControls {...defaultProps} onHome={onHome} />);
      
      const homeButton = screen.getByLabelText('Home all axes');
      fireEvent.click(homeButton);
      
      expect(onHome).toHaveBeenCalledWith(['X', 'Y', 'Z']);
    });

    it('handles individual axis homing', () => {
      const onHome = jest.fn();
      render(<TouchJogControls {...defaultProps} onHome={onHome} />);
      
      // In full layout, individual home buttons should be available
      const homeXButton = screen.getByText('Home X');
      fireEvent.click(homeXButton);
      
      expect(onHome).toHaveBeenCalledWith(['X']);
    });
  });

  describe('Lock Controls', () => {
    it('shows lock/unlock toggle', () => {
      render(<TouchJogControls {...defaultProps} />);
      
      expect(screen.getByText('Lock Controls')).toBeInTheDocument();
    });

    it('disables controls when locked', () => {
      const onJog = jest.fn();
      render(<TouchJogControls {...defaultProps} onJog={onJog} />);
      
      // Lock controls
      const lockButton = screen.getByText('Lock Controls');
      fireEvent.click(lockButton);
      
      // Should show unlock button
      expect(screen.getByText('Unlock Controls')).toBeInTheDocument();
      
      // Try to jog - should be disabled
      const xPlusButton = screen.getByText('X+');
      TouchEventSimulator.tap(xPlusButton);
      
      expect(onJog).not.toHaveBeenCalled();
    });

    it('re-enables controls when unlocked', () => {
      const onJog = jest.fn();
      render(<TouchJogControls {...defaultProps} onJog={onJog} />);
      
      // Lock then unlock
      const lockButton = screen.getByText('Lock Controls');
      fireEvent.click(lockButton);
      
      const unlockButton = screen.getByText('Unlock Controls');
      fireEvent.click(unlockButton);
      
      // Should be able to jog again
      const xPlusButton = screen.getByText('X+');
      TouchEventSimulator.tap(xPlusButton);
      
      expect(onJog).toHaveBeenCalledWith('X', 1, 1);
    });
  });

  describe('Disabled State', () => {
    it('disables all controls when disabled prop is true', () => {
      const onJog = jest.fn();
      render(<TouchJogControls {...defaultProps} disabled onJog={onJog} />);
      
      const xPlusButton = screen.getByText('X+');
      TouchEventSimulator.tap(xPlusButton);
      
      expect(onJog).not.toHaveBeenCalled();
    });

    it('shows appropriate disabled styling', () => {
      render(<TouchJogControls {...defaultProps} disabled />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        if (button.textContent?.includes('+') || button.textContent?.includes('-')) {
          expect(button).toBeDisabled();
        }
      });
    });
  });

  describe('Responsive Layouts', () => {
    it('uses compact layout on small screens', () => {
      renderWithMobileContext(
        <TouchJogControls {...defaultProps} />,
        { mobileContext: { ...defaultMobileContext, breakpoint: 'xs' } }
      );
      
      // Compact layout should have simplified structure
      expect(screen.getByText('XY Controls')).toBeInTheDocument();
      expect(screen.getByText('Z Controls')).toBeInTheDocument();
    });

    it('uses full layout on larger screens', () => {
      renderWithMobileContext(
        <TouchJogControls {...defaultProps} />,
        { mobileContext: tabletContext }
      );
      
      // Full layout should have individual home buttons
      expect(screen.getByText('Home Individual Axes')).toBeInTheDocument();
    });

    it('adapts to orientation changes', () => {
      const { rerender } = renderWithMobileContext(
        <TouchJogControls {...defaultProps} />,
        { mobileContext: { ...tabletContext, orientation: 'portrait' } }
      );
      
      // Switch to landscape
      ResponsiveTestUtils.setOrientation('landscape');
      
      rerender(<TouchJogControls {...defaultProps} />);
      
      // Layout should adapt to landscape
      const container = screen.getByText('XY Controls').closest('div');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for all controls', async () => {
      const { container } = render(<TouchJogControls {...defaultProps} />);
      
      const issues = await AccessibilityTestUtils.checkAriaLabels(container);
      expect(issues).toHaveLength(0);
    });

    it('meets touch target size requirements', async () => {
      const { container } = render(<TouchJogControls {...defaultProps} />);
      
      const issues = await AccessibilityTestUtils.checkTouchTargetSize(container);
      expect(issues).toHaveLength(0);
    });

    it('supports keyboard navigation', async () => {
      const onJog = jest.fn();
      const user = userEvent.setup();
      
      render(<TouchJogControls {...defaultProps} onJog={onJog} />);
      
      // Tab to first jog button and activate
      await user.tab();
      await user.keyboard('[Enter]');
      
      expect(onJog).toHaveBeenCalled();
    });

    it('provides clear visual feedback for active controls', () => {
      render(<TouchJogControls {...defaultProps} enableContinuousJog />);
      
      const xPlusButton = screen.getByText('X+');
      
      fireEvent.touchStart(xPlusButton);
      
      // Should show active state
      expect(xPlusButton.closest('button')).toHaveClass('active:scale-95');
    });
  });

  describe('Performance', () => {
    it('handles rapid jog commands efficiently', () => {
      const onJog = jest.fn();
      render(<TouchJogControls {...defaultProps} onJog={onJog} />);
      
      const xPlusButton = screen.getByText('X+');
      
      // Rapid fire jog commands
      for (let i = 0; i < 20; i++) {
        TouchEventSimulator.tap(xPlusButton);
      }
      
      expect(onJog).toHaveBeenCalledTimes(20);
    });

    it('cleans up timers properly', () => {
      const { unmount } = render(
        <TouchJogControls {...defaultProps} enableContinuousJog />
      );
      
      const xPlusButton = screen.getByText('X+');
      
      // Start continuous jog
      fireEvent.touchStart(xPlusButton);
      
      // Unmount component
      unmount();
      
      // Should not throw errors or leak timers
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    });
  });
});
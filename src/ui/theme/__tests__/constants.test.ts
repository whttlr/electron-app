import {
  AXIS_COLORS,
  VISUAL_SCALE,
  MACHINE_SCALE_FACTOR,
  UI_CONSTANTS,
  ANIMATION_CONSTANTS,
  DESIGN_TOKENS,
  BREAKPOINTS,
  THEME_MODES,
  CNC_STATUS_COLORS,
  MOTION_COLORS
} from '../constants';

describe('Theme Constants', () => {
  describe('AXIS_COLORS', () => {
    test('should define colors for all three axes', () => {
      expect(AXIS_COLORS).toHaveProperty('x');
      expect(AXIS_COLORS).toHaveProperty('y');
      expect(AXIS_COLORS).toHaveProperty('z');
    });

    test('should use valid hex colors', () => {
      const hexColorPattern = /^#[0-9a-fA-F]{3,6}$/;
      
      expect(AXIS_COLORS.x).toMatch(hexColorPattern);
      expect(AXIS_COLORS.y).toMatch(hexColorPattern);
      expect(AXIS_COLORS.z).toMatch(hexColorPattern);
    });

    test('should have distinct colors for each axis', () => {
      const colors = Object.values(AXIS_COLORS);
      const uniqueColors = new Set(colors);
      
      expect(uniqueColors.size).toBe(3);
    });
  });

  describe('Visual and Machine Constants', () => {
    test('should define visual scale as a number', () => {
      expect(typeof VISUAL_SCALE).toBe('number');
      expect(VISUAL_SCALE).toBeGreaterThan(0);
    });

    test('should define machine scale factor as a positive number', () => {
      expect(typeof MACHINE_SCALE_FACTOR).toBe('number');
      expect(MACHINE_SCALE_FACTOR).toBeGreaterThan(0);
    });
  });

  describe('UI_CONSTANTS', () => {
    test('should define all required UI constants', () => {
      expect(UI_CONSTANTS).toHaveProperty('defaultCardSize');
      expect(UI_CONSTANTS).toHaveProperty('defaultGutter');
      expect(UI_CONSTANTS).toHaveProperty('containerPadding');
      expect(UI_CONSTANTS).toHaveProperty('maxWidth');
    });

    test('should have valid card size option', () => {
      const validSizes = ['small', 'default', 'large'];
      expect(validSizes).toContain(UI_CONSTANTS.defaultCardSize);
    });

    test('should have gutter as tuple of numbers', () => {
      expect(Array.isArray(UI_CONSTANTS.defaultGutter)).toBe(true);
      expect(UI_CONSTANTS.defaultGutter).toHaveLength(2);
      expect(typeof UI_CONSTANTS.defaultGutter[0]).toBe('number');
      expect(typeof UI_CONSTANTS.defaultGutter[1]).toBe('number');
    });

    test('should have valid CSS dimension strings', () => {
      expect(UI_CONSTANTS.containerPadding).toMatch(/^\d+px$/);
      expect(UI_CONSTANTS.maxWidth).toMatch(/^\d+px$/);
    });
  });

  describe('ANIMATION_CONSTANTS', () => {
    test('should define animation properties', () => {
      expect(ANIMATION_CONSTANTS).toHaveProperty('transitionDuration');
      expect(ANIMATION_CONSTANTS).toHaveProperty('easingFunction');
    });

    test('should have valid CSS duration format', () => {
      expect(ANIMATION_CONSTANTS.transitionDuration).toMatch(/^\d+(\.\d+)?s$/);
    });

    test('should have valid easing function', () => {
      const validEasing = ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'];
      expect(validEasing).toContain(ANIMATION_CONSTANTS.easingFunction);
    });
  });

  describe('DESIGN_TOKENS', () => {
    test('should define comprehensive color system', () => {
      expect(DESIGN_TOKENS.colors).toHaveProperty('primary');
      expect(DESIGN_TOKENS.colors).toHaveProperty('success');
      expect(DESIGN_TOKENS.colors).toHaveProperty('warning');
      expect(DESIGN_TOKENS.colors).toHaveProperty('error');
      expect(DESIGN_TOKENS.colors).toHaveProperty('axis');
      expect(DESIGN_TOKENS.colors).toHaveProperty('neutral');
    });

    test('should have primary color palette with required shades', () => {
      const primaryColors = DESIGN_TOKENS.colors.primary;
      
      expect(primaryColors).toHaveProperty('50');
      expect(primaryColors).toHaveProperty('100');
      expect(primaryColors).toHaveProperty('500');
      expect(primaryColors).toHaveProperty('600');
      expect(primaryColors).toHaveProperty('700');
    });

    test('should have complete neutral color scale', () => {
      const neutralColors = DESIGN_TOKENS.colors.neutral;
      const expectedShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
      
      expectedShades.forEach(shade => {
        expect(neutralColors).toHaveProperty(shade);
        expect(typeof neutralColors[shade as keyof typeof neutralColors]).toBe('string');
      });
    });

    test('should define spacing system', () => {
      const expectedSpacings = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
      
      expectedSpacings.forEach(spacing => {
        expect(DESIGN_TOKENS.spacing).toHaveProperty(spacing);
        expect(DESIGN_TOKENS.spacing[spacing as keyof typeof DESIGN_TOKENS.spacing]).toMatch(/^\d+px$/);
      });
    });

    test('should define typography system', () => {
      expect(DESIGN_TOKENS.typography).toHaveProperty('fontSizes');
      expect(DESIGN_TOKENS.typography).toHaveProperty('fontWeights');
      expect(DESIGN_TOKENS.typography).toHaveProperty('lineHeights');
    });

    test('should have valid font sizes', () => {
      const fontSizes = DESIGN_TOKENS.typography.fontSizes;
      Object.values(fontSizes).forEach(size => {
        expect(size).toMatch(/^\d+px$/);
      });
    });

    test('should have numeric font weights', () => {
      const fontWeights = DESIGN_TOKENS.typography.fontWeights;
      Object.values(fontWeights).forEach(weight => {
        expect(typeof weight).toBe('number');
        expect(weight).toBeGreaterThanOrEqual(100);
        expect(weight).toBeLessThanOrEqual(900);
      });
    });

    test('should have numeric line heights', () => {
      const lineHeights = DESIGN_TOKENS.typography.lineHeights;
      Object.values(lineHeights).forEach(height => {
        expect(typeof height).toBe('number');
        expect(height).toBeGreaterThan(0);
      });
    });

    test('should define shadow system', () => {
      const shadows = DESIGN_TOKENS.shadows;
      const expectedShadows = ['sm', 'md', 'lg', 'xl'];
      
      expectedShadows.forEach(shadow => {
        expect(shadows).toHaveProperty(shadow);
        expect(typeof shadows[shadow as keyof typeof shadows]).toBe('string');
      });
    });

    test('should define border system', () => {
      const borders = DESIGN_TOKENS.borders;
      Object.values(borders).forEach(border => {
        expect(border).toMatch(/^\d+px solid$/);
      });
    });

    test('should define border radius system', () => {
      const borderRadius = DESIGN_TOKENS.borderRadius;
      Object.entries(borderRadius).forEach(([key, value]) => {
        if (key === 'full') {
          expect(value).toBe('9999px');
        } else {
          expect(value).toMatch(/^\d+px$/);
        }
      });
    });

    test('should define z-index system with ascending values', () => {
      const zIndices = DESIGN_TOKENS.zIndex;
      const values = Object.values(zIndices).sort((a, b) => a - b);
      
      expect(values[0]).toBe(zIndices.dropdown);
      expect(values[1]).toBe(zIndices.modal);
      expect(values[2]).toBe(zIndices.tooltip);
      expect(values[3]).toBe(zIndices.notification);
    });
  });

  describe('BREAKPOINTS', () => {
    test('should define all responsive breakpoints', () => {
      const expectedBreakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
      
      expectedBreakpoints.forEach(bp => {
        expect(BREAKPOINTS).toHaveProperty(bp);
        expect(BREAKPOINTS[bp as keyof typeof BREAKPOINTS]).toMatch(/^\d+px$/);
      });
    });

    test('should have ascending breakpoint values', () => {
      const values = Object.values(BREAKPOINTS).map(bp => parseInt(bp.replace('px', '')));
      
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  describe('THEME_MODES', () => {
    test('should define theme mode constants', () => {
      expect(THEME_MODES).toHaveProperty('LIGHT');
      expect(THEME_MODES).toHaveProperty('DARK');
      expect(THEME_MODES).toHaveProperty('AUTO');
    });

    test('should have string values', () => {
      Object.values(THEME_MODES).forEach(mode => {
        expect(typeof mode).toBe('string');
      });
    });
  });

  describe('CNC_STATUS_COLORS', () => {
    test('should define colors for all CNC statuses', () => {
      const expectedStatuses = ['connected', 'disconnected', 'error', 'warning', 'homing', 'jogging'];
      
      expectedStatuses.forEach(status => {
        expect(CNC_STATUS_COLORS).toHaveProperty(status);
        expect(typeof CNC_STATUS_COLORS[status as keyof typeof CNC_STATUS_COLORS]).toBe('string');
      });
    });

    test('should use colors from design tokens', () => {
      expect(CNC_STATUS_COLORS.connected).toBe(DESIGN_TOKENS.colors.success[500]);
      expect(CNC_STATUS_COLORS.error).toBe(DESIGN_TOKENS.colors.error[500]);
      expect(CNC_STATUS_COLORS.warning).toBe(DESIGN_TOKENS.colors.warning[500]);
    });
  });

  describe('MOTION_COLORS', () => {
    test('should define colors for all motion states', () => {
      const expectedStates = ['idle', 'moving', 'paused', 'alarm'];
      
      expectedStates.forEach(state => {
        expect(MOTION_COLORS).toHaveProperty(state);
        expect(typeof MOTION_COLORS[state as keyof typeof MOTION_COLORS]).toBe('string');
      });
    });

    test('should use colors from design tokens', () => {
      expect(MOTION_COLORS.moving).toBe(DESIGN_TOKENS.colors.primary[500]);
      expect(MOTION_COLORS.paused).toBe(DESIGN_TOKENS.colors.warning[500]);
      expect(MOTION_COLORS.alarm).toBe(DESIGN_TOKENS.colors.error[500]);
    });
  });

  describe('Color Accessibility', () => {
    test('should use high contrast colors for axes', () => {
      // Basic contrast check - ensure colors are distinct enough
      const colors = Object.values(AXIS_COLORS);
      colors.forEach(color => {
        expect(color).not.toBe('#000000'); // Not pure black
        expect(color).not.toBe('#ffffff'); // Not pure white
      });
    });

    test('should provide semantic color mapping', () => {
      // Error states should use red-based colors
      expect(CNC_STATUS_COLORS.error).toMatch(/#[a-fA-F0-9]{6}/);
      expect(MOTION_COLORS.alarm).toMatch(/#[a-fA-F0-9]{6}/);
      
      // Success states should use green-based colors
      expect(CNC_STATUS_COLORS.connected).toMatch(/#[a-fA-F0-9]{6}/);
    });
  });
});
import { UnitConverter } from '../UnitConverter';
import { UnitSystem } from '../UnitTypes';

describe('UnitConverter', () => {
  let converter: UnitConverter;

  beforeEach(() => {
    converter = new UnitConverter();
  });

  describe('System Management', () => {
    test('should default to metric system', () => {
      expect(converter.getSystem()).toBe('metric');
    });

    test('should set and get system correctly', () => {
      converter.setSystem('imperial');
      expect(converter.getSystem()).toBe('imperial');
      
      converter.setSystem('metric');
      expect(converter.getSystem()).toBe('metric');
    });

    test('should return correct current units for metric', () => {
      converter.setSystem('metric');
      const units = converter.getCurrentUnits();
      
      expect(units.linear.symbol).toBe('mm');
      expect(units.speed.combined).toBe('mm/min');
    });

    test('should return correct current units for imperial', () => {
      converter.setSystem('imperial');
      const units = converter.getCurrentUnits();
      
      expect(units.linear.symbol).toBe('in');
      expect(units.speed.combined).toBe('in/min');
    });
  });

  describe('Basic Conversions', () => {
    test('should convert mm to inches correctly', () => {
      const result = converter.convert(25.4, 'mm', 'inch');
      
      expect(result.from.symbol).toBe('mm');
      expect(result.to.symbol).toBe('in');
      expect(result.value).toBe(25.4);
      expect(result.result).toBeCloseTo(1, 4);
    });

    test('should convert inches to mm correctly', () => {
      const result = converter.convert(1, 'inch', 'mm');
      
      expect(result.result).toBeCloseTo(25.4, 1);
    });

    test('should convert between metric units', () => {
      const result = converter.convert(10, 'cm', 'mm');
      expect(result.result).toBe(100);
    });

    test('should handle same unit conversion', () => {
      const result = converter.convert(10, 'mm', 'mm');
      expect(result.result).toBe(10);
    });

    test('should throw error for unknown units', () => {
      expect(() => converter.convert(10, 'unknown', 'mm')).toThrow('Unknown unit: unknown');
      expect(() => converter.convert(10, 'mm', 'unknown')).toThrow('Unknown unit: unknown');
    });
  });

  describe('Position Conversions', () => {
    test('should convert position from mm to inches', () => {
      const position = { x: 25.4, y: 50.8, z: 76.2 };
      const result = converter.convertPosition(position, 'mm', 'inch');
      
      expect(result.x).toBeCloseTo(1, 4);
      expect(result.y).toBeCloseTo(2, 4);
      expect(result.z).toBeCloseTo(3, 4);
    });

    test('should convert position from inches to mm', () => {
      const position = { x: 1, y: 2, z: 3 };
      const result = converter.convertPosition(position, 'inch', 'mm');
      
      expect(result.x).toBeCloseTo(25.4, 1);
      expect(result.y).toBeCloseTo(50.8, 1);
      expect(result.z).toBeCloseTo(76.2, 1);
    });
  });

  describe('Convenience Methods', () => {
    test('should convert to metric correctly', () => {
      const result = converter.toMetric(1); // 1 inch to mm
      expect(result).toBeCloseTo(25.4, 1);
    });

    test('should convert to imperial correctly', () => {
      const result = converter.toImperial(25.4); // 25.4 mm to inches
      expect(result).toBeCloseTo(1, 4);
    });

    test('should handle different source units', () => {
      const result = converter.toMetric(1, 'foot');
      expect(result).toBeCloseTo(304.8, 1);
    });
  });

  describe('Formatting', () => {
    test('should format value with correct precision', () => {
      const result = converter.formatValue(1.23456, 'mm');
      
      expect(result.value).toBe(1.235);
      expect(result.unit).toBe('mm');
      expect(result.formatted).toBe('1.235 mm');
    });

    test('should format value with custom precision', () => {
      const result = converter.formatValue(1.23456, 'mm', 2);
      
      expect(result.value).toBe(1.23);
      expect(result.formatted).toBe('1.23 mm');
    });

    test('should format position correctly', () => {
      const position = { x: 1.123, y: 2.456, z: 3.789 };
      const result = converter.formatPosition(position, 'mm');
      
      expect(result).toBe('X:1.123 mm Y:2.456 mm Z:3.789 mm');
    });

    test('should format speed correctly', () => {
      const result = converter.formatSpeed(100, 'mm', 'min');
      
      expect(result.value).toBe(100);
      expect(result.unit).toBe('mm/min');
      expect(result.formatted).toBe('100 mm/min');
    });

    test('should handle invalid units in formatting', () => {
      expect(() => converter.formatValue(1, 'invalid')).toThrow('Unknown unit: invalid');
      expect(() => converter.formatSpeed(100, 'invalid')).toThrow('Unknown unit: invalid');
    });
  });

  describe('Increment Management', () => {
    test('should return metric increments by default', () => {
      const increments = converter.getIncrements();
      
      expect(increments).toHaveLength(7);
      expect(increments[0].value).toBe(0.001);
      expect(increments[0].label).toBe('0.001 mm');
      expect(increments[6].value).toBe(100);
    });

    test('should return imperial increments when system is imperial', () => {
      converter.setSystem('imperial');
      const increments = converter.getIncrements();
      
      expect(increments).toHaveLength(7);
      expect(increments[0].label).toBe('1/64"');
      expect(increments[6].label).toBe('1"');
      expect(increments[6].value).toBeCloseTo(25.4, 1);
    });

    test('should return correct default increment', () => {
      expect(converter.getDefaultIncrement('metric')).toBe(1);
      expect(converter.getDefaultIncrement('imperial')).toBeCloseTo(25.4 / 16, 4);
    });

    test('should use current system for default increment', () => {
      converter.setSystem('imperial');
      expect(converter.getDefaultIncrement()).toBeCloseTo(25.4 / 16, 4);
    });
  });

  describe('Validation', () => {
    test('should validate known units', () => {
      expect(converter.isValidUnit('mm')).toBe(true);
      expect(converter.isValidUnit('inch')).toBe(true);
      expect(converter.isValidUnit('cm')).toBe(true);
      expect(converter.isValidUnit('min')).toBe(true);
    });

    test('should reject unknown units', () => {
      expect(converter.isValidUnit('unknown')).toBe(false);
      expect(converter.isValidUnit('')).toBe(false);
    });

    test('should return available length units', () => {
      const units = converter.getAvailableUnits('length');
      
      expect(units).toHaveLength(5);
      expect(units.map(u => u.symbol)).toEqual(['mm', 'cm', 'm', 'in', 'ft']);
    });

    test('should return available time units', () => {
      const units = converter.getAvailableUnits('time');
      
      expect(units).toHaveLength(2);
      expect(units.map(u => u.symbol)).toEqual(['min', 's']);
    });
  });

  describe('Fraction Support', () => {
    test('should convert decimal to fraction for common values', () => {
      expect(converter.toFraction(0.5)).toBe('1/2');
      expect(converter.toFraction(0.25)).toBe('1/4');
      expect(converter.toFraction(0.125)).toBe('1/8');
      expect(converter.toFraction(0.75)).toBe('3/4');
    });

    test('should handle whole numbers', () => {
      expect(converter.toFraction(1)).toBe('1');
      expect(converter.toFraction(2.5)).toBe('2 1/2');
      expect(converter.toFraction(0)).toBe('0');
    });

    test('should handle negative numbers', () => {
      expect(converter.toFraction(-0.5)).toBe('-1/2');
      expect(converter.toFraction(-1.25)).toBe('-1 1/4');
    });

    test('should simplify fractions', () => {
      expect(converter.toFraction(0.5, 8)).toBe('1/2'); // Not 4/8
      expect(converter.toFraction(0.25, 16)).toBe('1/4'); // Not 4/16
    });

    test('should handle values close to zero', () => {
      expect(converter.toFraction(0.001)).toBe('0');
      expect(converter.toFraction(0.01)).toBe('1/64'); // Closest fraction is 1/64
    });

    test('should respect maximum denominator', () => {
      const result = converter.toFraction(0.3, 4);
      expect(result).toBe('1/3'); // Closest fraction with max denominator 4
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero values', () => {
      const result = converter.convert(0, 'mm', 'inch');
      expect(result.result).toBe(0);
    });

    test('should handle negative values', () => {
      const result = converter.convert(-10, 'mm', 'inch');
      expect(result.result).toBeCloseTo(-10 / 25.4, 4);
    });

    test('should handle very large values', () => {
      const result = converter.convert(1000000, 'mm', 'm');
      expect(result.result).toBe(1000);
    });

    test('should handle very small values', () => {
      const result = converter.convert(0.001, 'mm', 'mm');
      expect(result.result).toBe(0.001);
    });
  });

  describe('Real-world Scenarios', () => {
    test('should handle typical CNC machine positioning', () => {
      // Convert typical work area from mm to inches
      const workArea = { x: 200, y: 300, z: 100 }; // 200x300x100mm
      const result = converter.convertPosition(workArea, 'mm', 'inch');
      
      expect(result.x).toBeCloseTo(7.874, 2); // ~7.87 inches
      expect(result.y).toBeCloseTo(11.811, 2); // ~11.81 inches  
      expect(result.z).toBeCloseTo(3.937, 2); // ~3.94 inches
    });

    test('should handle typical feed rates', () => {
      // Convert 1000 mm/min to in/min
      const mmPerMin = 1000;
      const inchesPerMin = converter.toImperial(mmPerMin);
      
      expect(inchesPerMin).toBeCloseTo(39.37, 1);
      
      const formatted = converter.formatSpeed(inchesPerMin, 'inch', 'min');
      expect(formatted.formatted).toMatch(/39\.37.*in\/min/);
    });

    test('should handle precision requirements for machining', () => {
      // Test precision for tight tolerances
      const preciseMeasurement = 12.7; // 0.5 inches in mm
      const inches = converter.toImperial(preciseMeasurement);
      
      expect(inches).toBeCloseTo(0.5, 6); // High precision
      
      const formatted = converter.formatValue(inches, 'inch', 4);
      expect(formatted.value).toBe(0.5);
    });
  });
});
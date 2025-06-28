import { UnitSystem, UnitDefinition, UnitConversion, FormattedValue, SpeedUnits } from './UnitTypes';
import { Position } from '../machine/MachineTypes';

export class UnitConverter {
  private currentSystem: UnitSystem = 'metric';

  // Unit definitions (all factors relative to mm)
  private readonly units: Record<string, UnitDefinition> = {
    // Length units
    mm: { name: 'millimeter', symbol: 'mm', factor: 1, precision: 3 },
    cm: { name: 'centimeter', symbol: 'cm', factor: 10, precision: 2 },
    m: { name: 'meter', symbol: 'm', factor: 1000, precision: 3 },
    inch: { name: 'inch', symbol: 'in', factor: 25.4, precision: 4 },
    foot: { name: 'foot', symbol: 'ft', factor: 304.8, precision: 3 },
    
    // Speed time units
    min: { name: 'minute', symbol: 'min', factor: 1, precision: 0 },
    sec: { name: 'second', symbol: 's', factor: 1/60, precision: 1 }
  };

  // Predefined increments for each system
  private readonly increments = {
    metric: [
      { value: 0.001, label: '0.001 mm' },
      { value: 0.01, label: '0.01 mm' },
      { value: 0.1, label: '0.1 mm' },
      { value: 1, label: '1 mm' },
      { value: 10, label: '10 mm' },
      { value: 50, label: '50 mm' },
      { value: 100, label: '100 mm' }
    ],
    imperial: [
      { value: 25.4 / 64, label: '1/64"' },
      { value: 25.4 / 32, label: '1/32"' },
      { value: 25.4 / 16, label: '1/16"' },
      { value: 25.4 / 8, label: '1/8"' },
      { value: 25.4 / 4, label: '1/4"' },
      { value: 25.4 / 2, label: '1/2"' },
      { value: 25.4, label: '1"' }
    ]
  };

  // System Management
  setSystem(system: UnitSystem): void {
    this.currentSystem = system;
  }

  getSystem(): UnitSystem {
    return this.currentSystem;
  }

  getCurrentUnits(): { linear: UnitDefinition; speed: SpeedUnits } {
    const linear = this.currentSystem === 'metric' ? this.units.mm : this.units.inch;
    const speedUnits: SpeedUnits = {
      linear,
      time: this.units.min,
      combined: `${linear.symbol}/${this.units.min.symbol}`
    };

    return { linear, speed: speedUnits };
  }

  // Basic Conversions
  convert(value: number, fromUnit: string, toUnit: string): UnitConversion {
    const from = this.units[fromUnit];
    const to = this.units[toUnit];

    if (!from || !to) {
      throw new Error(`Unknown unit: ${!from ? fromUnit : toUnit}`);
    }

    // Convert through base unit (mm)
    const baseValue = value * from.factor;
    const result = baseValue / to.factor;

    return { from, to, value, result };
  }

  // Position Conversions
  convertPosition(position: Position, fromUnit: string, toUnit: string): Position {
    const conversionX = this.convert(position.x, fromUnit, toUnit);
    const conversionY = this.convert(position.y, fromUnit, toUnit);
    const conversionZ = this.convert(position.z, fromUnit, toUnit);

    return {
      x: conversionX.result,
      y: conversionY.result,
      z: conversionZ.result
    };
  }

  toMetric(value: number, fromImperialUnit: string = 'inch'): number {
    return this.convert(value, fromImperialUnit, 'mm').result;
  }

  toImperial(value: number, fromMetricUnit: string = 'mm'): number {
    return this.convert(value, fromMetricUnit, 'inch').result;
  }

  // Formatting
  formatValue(value: number, unit: string, precision?: number): FormattedValue {
    const unitDef = this.units[unit];
    if (!unitDef) {
      throw new Error(`Unknown unit: ${unit}`);
    }

    const finalPrecision = precision ?? unitDef.precision;
    const formattedValue = Number(value.toFixed(finalPrecision));
    
    return {
      value: formattedValue,
      unit: unitDef.symbol,
      formatted: `${formattedValue} ${unitDef.symbol}`
    };
  }

  formatPosition(position: Position, unit: string, precision?: number): string {
    const x = this.formatValue(position.x, unit, precision);
    const y = this.formatValue(position.y, unit, precision);
    const z = this.formatValue(position.z, unit, precision);

    return `X:${x.formatted} Y:${y.formatted} Z:${z.formatted}`;
  }

  formatSpeed(value: number, linearUnit: string = 'mm', timeUnit: string = 'min'): FormattedValue {
    const linear = this.units[linearUnit];
    const time = this.units[timeUnit];

    if (!linear || !time) {
      throw new Error(`Unknown unit: ${!linear ? linearUnit : timeUnit}`);
    }

    return {
      value,
      unit: `${linear.symbol}/${time.symbol}`,
      formatted: `${value} ${linear.symbol}/${time.symbol}`
    };
  }

  // Increment Management
  getIncrements(system?: UnitSystem): { value: number; label: string }[] {
    const targetSystem = system || this.currentSystem;
    return [...this.increments[targetSystem]];
  }

  getDefaultIncrement(system?: UnitSystem): number {
    const targetSystem = system || this.currentSystem;
    return targetSystem === 'metric' ? 1 : 25.4 / 16; // 1mm or 1/16"
  }

  // Validation
  isValidUnit(unit: string): boolean {
    return unit in this.units;
  }

  getAvailableUnits(type: 'length' | 'time' = 'length'): UnitDefinition[] {
    if (type === 'length') {
      return [this.units.mm, this.units.cm, this.units.m, this.units.inch, this.units.foot];
    } else {
      return [this.units.min, this.units.sec];
    }
  }

  // Fraction Support (for Imperial)
  toFraction(decimal: number, maxDenominator: number = 64): string {
    if (decimal === 0) return '0';
    
    const sign = decimal < 0 ? '-' : '';
    const abs = Math.abs(decimal);
    const whole = Math.floor(abs);
    const fractional = abs - whole;

    if (fractional < 1 / (maxDenominator * 2)) {
      return `${sign}${whole || '0'}`;
    }

    // Find closest fraction
    let bestNumerator = 1;
    let bestDenominator = maxDenominator;
    let bestError = Math.abs(fractional - bestNumerator / bestDenominator);

    for (let denominator = 2; denominator <= maxDenominator; denominator++) {
      const numerator = Math.round(fractional * denominator);
      const error = Math.abs(fractional - numerator / denominator);
      
      if (error < bestError) {
        bestError = error;
        bestNumerator = numerator;
        bestDenominator = denominator;
      }
    }

    // Simplify fraction
    const gcd = this.greatestCommonDivisor(bestNumerator, bestDenominator);
    bestNumerator /= gcd;
    bestDenominator /= gcd;

    const fractionPart = bestDenominator === 1 ? `${bestNumerator}` : `${bestNumerator}/${bestDenominator}`;
    
    if (whole > 0) {
      return `${sign}${whole} ${fractionPart}`;
    } else {
      return `${sign}${fractionPart}`;
    }
  }

  private greatestCommonDivisor(a: number, b: number): number {
    return b === 0 ? a : this.greatestCommonDivisor(b, a % b);
  }
}
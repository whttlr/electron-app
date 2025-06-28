export type UnitSystem = 'metric' | 'imperial';

export interface UnitDefinition {
  name: string;
  symbol: string;
  factor: number; // Conversion factor to base unit (mm)
  precision: number;
}

export interface UnitConversion {
  from: UnitDefinition;
  to: UnitDefinition;
  value: number;
  result: number;
}

export interface FormattedValue {
  value: number;
  unit: string;
  formatted: string;
}

export interface SpeedUnits {
  linear: UnitDefinition;
  time: UnitDefinition;
  combined: string;
}
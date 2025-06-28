# Units Module

Module for unit conversion, formatting, and measurement system management.

## Overview

The units module provides:
- Metric/Imperial unit system management
- Position and speed unit conversions
- Formatted value display with proper precision
- Imperial fraction support
- Predefined increment values

## Usage

```typescript
import { unitConverter } from '@/core/units';

// System management
unitConverter.setSystem('imperial');
const currentUnits = unitConverter.getCurrentUnits();

// Basic conversions
const conversion = unitConverter.convert(25.4, 'mm', 'inch'); // 1 inch
const metricValue = unitConverter.toMetric(1, 'inch'); // 25.4 mm

// Position conversions
const imperialPos = unitConverter.convertPosition(
  { x: 25.4, y: 50.8, z: 12.7 }, 
  'mm', 
  'inch'
); // { x: 1, y: 2, z: 0.5 }

// Formatting
const formatted = unitConverter.formatValue(25.4, 'mm');
// { value: 25.4, unit: 'mm', formatted: '25.4 mm' }

const posStr = unitConverter.formatPosition({ x: 1, y: 2, z: 0.5 }, 'inch');
// "X:1.0000 in Y:2.0000 in Z:0.5000 in"

// Speed formatting
const speed = unitConverter.formatSpeed(1000, 'mm', 'min');
// { value: 1000, unit: 'mm/min', formatted: '1000 mm/min' }

// Increments
const increments = unitConverter.getIncrements('metric');
// [{ value: 0.001, label: '0.001 mm' }, ...]

// Fractions (Imperial)
const fraction = unitConverter.toFraction(0.0625); // "1/16"
```

## API

### UnitConverter

#### System Management
- `setSystem(system: UnitSystem): void` - Set metric/imperial
- `getSystem(): UnitSystem` - Get current system
- `getCurrentUnits()` - Get current linear and speed units

#### Conversions
- `convert(value, fromUnit, toUnit): UnitConversion` - Basic conversion
- `convertPosition(position, fromUnit, toUnit): Position` - Convert coordinates
- `toMetric(value, fromImperialUnit): number` - Convert to metric
- `toImperial(value, fromMetricUnit): number` - Convert to imperial

#### Formatting
- `formatValue(value, unit, precision?): FormattedValue` - Format with units
- `formatPosition(position, unit, precision?): string` - Format coordinates
- `formatSpeed(value, linearUnit, timeUnit): FormattedValue` - Format speed

#### Increments
- `getIncrements(system?): Array` - Get jog increments for system
- `getDefaultIncrement(system?): number` - Get default increment

#### Imperial Fractions
- `toFraction(decimal, maxDenominator?): string` - Convert to fraction

## Testing

```bash
npm test -- --testPathPatterns=units
```
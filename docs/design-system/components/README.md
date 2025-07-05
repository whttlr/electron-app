# Component API Documentation

> Comprehensive documentation for all design system components

## Table of Contents

- [Button](#button)
- [Input](#input)
- [Card](#card)
- [Badge](#badge)
- [Progress](#progress)
- [Tooltip](#tooltip)
- [CNC-Specific Components](#cnc-specific-components)
  - [JogControls](#jogcontrols)
  - [CoordinateInput](#coordinateinput)
  - [MachineStatus](#machinestatus)
  - [EmergencyButton](#emergencybutton)

---

## Button

Versatile button component with multiple variants and states.

### Basic Usage

```tsx
import { Button } from '@/ui/adapters/ant-design/Button';

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'emergency' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `disabled` | `boolean` | `false` | Whether button is disabled |
| `loading` | `boolean` | `false` | Whether button shows loading state |
| `icon` | `React.ReactNode` | - | Icon to display in button |
| `fullWidth` | `boolean` | `false` | Whether button takes full width |
| `children` | `React.ReactNode` | - | Button content |
| `onClick` | `() => void` | - | Click handler |

### Variants

```tsx
// Primary action button
<Button variant="primary">Save Changes</Button>

// Secondary action button
<Button variant="secondary">Cancel</Button>

// Emergency action button
<Button variant="emergency">EMERGENCY STOP</Button>

// Success action button
<Button variant="success">Start Job</Button>

// Warning action button
<Button variant="warning">Pause</Button>

// Danger action button
<Button variant="danger">Delete</Button>
```

### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### States

```tsx
// Loading state
<Button loading>Saving...</Button>

// Disabled state
<Button disabled>Cannot Click</Button>

// With icon
<Button icon={<PlusIcon />}>Add Item</Button>
```

### Accessibility

- Supports keyboard navigation (Enter, Space)
- Proper ARIA attributes
- Focus management
- Screen reader support

---

## Input

Flexible input component with validation and multiple types.

### Basic Usage

```tsx
import { Input } from '@/ui/adapters/ant-design/Input';

<Input
  placeholder="Enter value"
  value={value}
  onChange={setValue}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'text' \| 'password' \| 'email' \| 'number' \| 'search'` | `'text'` | Input type |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Input size |
| `status` | `'default' \| 'error' \| 'warning' \| 'success'` | `'default'` | Validation status |
| `disabled` | `boolean` | `false` | Whether input is disabled |
| `placeholder` | `string` | - | Placeholder text |
| `value` | `string \| number` | - | Input value |
| `onChange` | `(value: string \| number) => void` | - | Change handler |
| `onBlur` | `() => void` | - | Blur handler |
| `prefix` | `React.ReactNode` | - | Prefix icon or text |
| `suffix` | `React.ReactNode` | - | Suffix icon or text |
| `maxLength` | `number` | - | Maximum character length |

### Types

```tsx
// Text input
<Input type="text" placeholder="Enter text" />

// Number input
<Input type="number" placeholder="Enter number" min={0} max={100} />

// Password input
<Input type="password" placeholder="Enter password" />

// Email input
<Input type="email" placeholder="Enter email" />
```

### Validation States

```tsx
// Error state
<Input
  status="error"
  value={value}
  onChange={setValue}
  aria-describedby="error-text"
/>
<div id="error-text" role="alert">This field is required</div>

// Warning state
<Input status="warning" placeholder="Check this value" />

// Success state
<Input status="success" placeholder="Valid input" />
```

### With Prefix/Suffix

```tsx
// With prefix icon
<Input prefix={<SearchIcon />} placeholder="Search..." />

// With suffix unit
<Input suffix="mm" placeholder="Enter distance" type="number" />
```

### Accessibility

- Proper ARIA attributes for validation states
- Label association support
- Error announcement for screen readers
- Keyboard navigation support

---

## Card

Container component for grouping related content.

### Basic Usage

```tsx
import { Card } from '@/ui/adapters/ant-design/Card';

<Card title="Machine Status">
  <p>Machine is currently idle</p>
</Card>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string \| React.ReactNode` | - | Card title |
| `subtitle` | `string \| React.ReactNode` | - | Card subtitle |
| `variant` | `'default' \| 'outlined' \| 'elevated'` | `'default'` | Card style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Card size |
| `actions` | `React.ReactNode[]` | - | Action buttons array |
| `extra` | `React.ReactNode` | - | Extra content in header |
| `loading` | `boolean` | `false` | Loading state |
| `children` | `React.ReactNode` | - | Card content |

### Variants

```tsx
// Default card
<Card title="Default Card">
  Content here
</Card>

// Outlined card
<Card variant="outlined" title="Outlined Card">
  Content here
</Card>

// Elevated card
<Card variant="elevated" title="Elevated Card">
  Content here
</Card>
```

### With Actions

```tsx
<Card
  title="Job Queue"
  actions={[
    <Button key="start">Start</Button>,
    <Button key="pause">Pause</Button>,
    <Button key="stop" variant="danger">Stop</Button>
  ]}
>
  <p>Current job: cutting_part_001.gcode</p>
</Card>
```

### Loading State

```tsx
<Card title="Loading Data" loading>
  Content will appear when loaded
</Card>
```

---

## Badge

Status indicator component for displaying small amounts of information.

### Basic Usage

```tsx
import { Badge } from '@/ui/adapters/ant-design/Badge';

<Badge variant="success" text="Online" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Badge color variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Badge size |
| `text` | `string \| number` | - | Badge text content |
| `icon` | `React.ReactNode` | - | Icon to display |
| `pulse` | `boolean` | `false` | Whether badge should pulse |
| `outline` | `boolean` | `false` | Whether badge is outlined |

### Variants

```tsx
<Badge variant="success" text="Connected" />
<Badge variant="warning" text="Warning" />
<Badge variant="danger" text="Error" />
<Badge variant="primary" text="Running" pulse />
```

### With Icons

```tsx
<Badge
  variant="success"
  icon={<CheckIcon />}
  text="Complete"
/>
```

---

## Progress

Progress indicator for showing completion status.

### Basic Usage

```tsx
import { Progress } from '@/ui/adapters/ant-design/Progress';

<Progress value={75} max={100} />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current progress value |
| `max` | `number` | `100` | Maximum progress value |
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Progress color variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Progress bar size |
| `showValue` | `boolean` | `true` | Whether to show percentage |
| `format` | `(value: number, max: number) => string` | - | Custom value formatter |
| `animated` | `boolean` | `false` | Whether to animate progress |

### Variants

```tsx
<Progress value={100} variant="success" />
<Progress value={75} variant="warning" />
<Progress value={25} variant="danger" />
```

### Custom Format

```tsx
<Progress
  value={750}
  max={1000}
  format={(value, max) => `${value}/${max} lines`}
/>
```

---

## Tooltip

Contextual information component that appears on hover or focus.

### Basic Usage

```tsx
import { Tooltip } from '@/ui/adapters/ant-design/Tooltip';

<Tooltip content="This is helpful information">
  <Button>Hover me</Button>
</Tooltip>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string \| React.ReactNode` | - | Tooltip content |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Tooltip placement |
| `trigger` | `'hover' \| 'focus' \| 'click'` | `'hover'` | Trigger method |
| `delay` | `number` | `100` | Show delay in milliseconds |
| `disabled` | `boolean` | `false` | Whether tooltip is disabled |
| `children` | `React.ReactElement` | - | Element to attach tooltip |

### Placements

```tsx
<Tooltip content="Top tooltip" placement="top">
  <Button>Top</Button>
</Tooltip>

<Tooltip content="Bottom tooltip" placement="bottom">
  <Button>Bottom</Button>
</Tooltip>
```

---

# CNC-Specific Components

## JogControls

Comprehensive machine jog control interface.

### Basic Usage

```tsx
import { JogControls } from '@/ui/forms/CNCForms';

<JogControls
  position={{ x: 0, y: 0, z: 0 }}
  onJog={handleJog}
  onHome={handleHome}
  disabled={!isConnected}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `Position3D` | - | Current machine position |
| `onJog` | `(axis: 'X' \| 'Y' \| 'Z', direction: 1 \| -1, distance: number) => void` | - | Jog handler |
| `onHome` | `(axes: Array<'X' \| 'Y' \| 'Z'>) => void` | - | Home handler |
| `disabled` | `boolean` | `false` | Whether controls are disabled |
| `stepSizes` | `number[]` | `[0.1, 1, 10]` | Available jog step sizes |
| `maxJogDistance` | `number` | `1000` | Maximum jog distance |
| `workingArea` | `WorkingArea` | - | Machine working area limits |

### Features

- Multi-axis jog controls (X, Y, Z)
- Variable step sizes
- Continuous jog mode
- Home positioning
- Visual position feedback
- Safety boundary checks

```tsx
<JogControls
  position={{ x: 150.5, y: 200.0, z: 25.0 }}
  onJog={(axis, direction, distance) => {
    console.log(`Jog ${axis} ${direction > 0 ? '+' : '-'}${distance}mm`);
  }}
  onHome={(axes) => {
    console.log(`Home axes: ${axes.join(', ')}`);
  }}
  stepSizes={[0.1, 1, 10, 100]}
  workingArea={{
    width: 300,
    height: 300,
    depth: 100,
    units: 'mm'
  }}
/>
```

---

## CoordinateInput

Specialized input for coordinate values with validation.

### Basic Usage

```tsx
import { CoordinateInput } from '@/ui/adapters/ant-design/Input';

<CoordinateInput
  axis="X"
  value={100.5}
  onChange={setXPosition}
  units="mm"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `axis` | `'X' \| 'Y' \| 'Z'` | - | Coordinate axis |
| `value` | `number` | - | Coordinate value |
| `onChange` | `(value: number) => void` | - | Change handler |
| `units` | `'mm' \| 'in'` | `'mm'` | Measurement units |
| `precision` | `number` | `2` | Decimal precision |
| `min` | `number` | - | Minimum value |
| `max` | `number` | - | Maximum value |
| `disabled` | `boolean` | `false` | Whether input is disabled |

### Features

- Automatic formatting
- Unit conversion
- Precision control
- Boundary validation
- Axis-specific styling

```tsx
<CoordinateInput
  axis="X"
  value={position.x}
  onChange={(value) => setPosition({ ...position, x: value })}
  units="mm"
  precision={3}
  min={-300}
  max={300}
/>
```

---

## MachineStatus

Comprehensive machine status display component.

### Basic Usage

```tsx
import { MachineStatus } from '@/ui/components/MachineStatus';

<MachineStatus
  status="running"
  position={{ x: 100, y: 200, z: 50 }}
  feedRate={1500}
  spindleSpeed={12000}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `MachineStatus` | - | Current machine status |
| `position` | `Position3D` | - | Current position |
| `feedRate` | `number` | - | Current feed rate |
| `spindleSpeed` | `number` | - | Current spindle speed |
| `temperature` | `number` | - | Machine temperature |
| `errors` | `string[]` | `[]` | Active error messages |
| `warnings` | `string[]` | `[]` | Active warning messages |
| `compact` | `boolean` | `false` | Whether to show compact view |

### Status Values

- `disconnected`: Machine not connected
- `connecting`: Attempting connection
- `connected`: Connected but idle
- `idle`: Ready for commands
- `running`: Executing job
- `paused`: Job paused
- `homing`: Performing homing sequence
- `error`: Error state
- `emergency`: Emergency stop active

```tsx
<MachineStatus
  status="running"
  position={{ x: 150.5, y: 200.0, z: 25.0 }}
  feedRate={1500}
  spindleSpeed={12000}
  temperature={45}
  errors={[]}
  warnings={['High temperature detected']}
/>
```

---

## EmergencyButton

Critical safety control for emergency stops.

### Basic Usage

```tsx
import { EmergencyButton } from '@/ui/adapters/ant-design/Button';

<EmergencyButton
  onEmergencyStop={handleEmergencyStop}
  disabled={!isConnected}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onEmergencyStop` | `() => void` | - | Emergency stop handler |
| `disabled` | `boolean` | `false` | Whether button is disabled |
| `size` | `'md' \| 'lg' \| 'xl'` | `'lg'` | Button size |
| `confirmRequired` | `boolean` | `false` | Whether confirmation is required |
| `children` | `React.ReactNode` | `'EMERGENCY STOP'` | Button text |

### Features

- High-contrast emergency styling
- Large touch target
- Immediate activation
- Optional confirmation dialog
- Accessible markup

```tsx
<EmergencyButton
  onEmergencyStop={() => {
    // Immediately halt all machine operations
    machine.emergencyStop();
  }}
  size="xl"
  confirmRequired={false} // No confirmation for true emergencies
/>
```

### Accessibility

- High contrast colors for visibility
- Large touch target (minimum 44px)
- Clear ARIA labels
- Keyboard accessible (Enter, Space)
- Screen reader announcements

---

## Usage Guidelines

### Component Selection

1. **Use CNC-specific components** for machine control interfaces
2. **Use standard components** for general UI elements
3. **Combine components** to create complex interactions
4. **Follow accessibility guidelines** for all components

### Best Practices

1. **Consistent sizing**: Use standardized size variants
2. **Proper validation**: Always validate user inputs
3. **Error handling**: Provide clear error messages
4. **Loading states**: Show progress for async operations
5. **Accessibility**: Test with keyboard and screen readers

### Performance Considerations

1. **Memoization**: Use React.memo for expensive components
2. **Lazy loading**: Load components on demand
3. **Virtual scrolling**: For large lists of components
4. **Debounced inputs**: For real-time value updates

---

## Migration Notes

When migrating between UI frameworks:

1. **Interface consistency**: Component props remain the same
2. **Style adaptation**: Visual appearance may vary
3. **Feature parity**: All features supported across adapters
4. **Testing required**: Verify functionality after migration

For detailed migration guides, see [Migration Documentation](../migration/README.md).

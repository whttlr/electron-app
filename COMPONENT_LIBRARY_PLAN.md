# CNC Jog Controls - Component Library Architecture Plan

## Executive Summary

We've successfully developed a comprehensive UI demo that showcases our design system. Now we need to extract these patterns into a reusable component library that maintains our visual identity while providing flexibility across the CNC application.

## Current State Analysis

### What We've Accomplished
1. **Established Design System**: Dark theme with purple accent, consistent spacing, typography hierarchy
2. **Core Component Set**: 40+ components with proper variants and interactions
3. **Specialized CNC Components**: Industry-specific controls for machine operation
4. **Animation Patterns**: Consistent micro-interactions and feedback
5. **Layout Systems**: Flexible grid and container components
6. **Typography System**: Gradient headings, proper text hierarchy, monospace for technical data

### Design Patterns We've Perfected
- **Color System**: HSL-based tokens with opacity variants (`/10`, `/20`, etc.)
- **Interactive States**: Hover, active, disabled, loading states
- **Animation Timing**: 200-300ms transitions, scale transforms, opacity changes
- **Spacing Scale**: Consistent gap patterns (`gap-2`, `gap-3`, `gap-4`)
- **Border Radius**: Unified `rounded-lg` (8px) across components
- **Shadow System**: Subtle shadows with hover elevation

## Component Library Architecture

### 1. Core Foundation Layer (`src/ui/foundation/`)

#### **Colors & Tokens** (`tokens.ts`)
```typescript
export const colorTokens = {
  background: 'hsl(240, 10%, 3.9%)',
  foreground: 'hsl(0, 0%, 98%)',
  primary: 'hsl(262, 83%, 58%)',
  // ... all 24 color tokens we've defined
}

export const spacingTokens = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '0.75rem', // 12px
  lg: '1rem',    // 16px
  xl: '1.5rem',  // 24px
}
```

#### **Animation Utilities** (`animations.ts`)
```typescript
export const animationPresets = {
  buttonPress: 'active:scale-95 transition transform-gpu ease-in-out duration-300',
  cardHover: 'hover:scale-[1.02] transition-all duration-200',
  fadeIn: 'animate-in fade-in duration-300',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
}
```

#### **Typography System** (`typography.ts`)
```typescript
export const headingClasses = {
  h1: 'text-4xl font-bold heading',
  h2: 'text-3xl font-semibold heading', 
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-medium',
  // ... complete hierarchy
}
```

### 2. Primitive Components (`src/ui/primitives/`)

#### **Button** - The Foundation
- **Variants**: 10 variants (default, destructive, outline, secondary, etc.)
- **Sizes**: 7 sizes including specialized `jog` size
- **States**: Hover, active, disabled, loading
- **Props**: `asChild`, `iconl`, `iconr` for composition

#### **Badge** - Status & Labels  
- **Variants**: Filled and outline versions in 6 colors
- **Special**: `StatusBadge` with pulsing dots for active states
- **Animation**: Conditional pulse for running/error/warning states

#### **Card** - Container System
- **Base Card**: Standard container with overflow-hidden fix
- **DashboardCard**: Interactive variant with hover effects
- **StatusCard**: CNC-specific with status color coding

#### **Alert** - Feedback System
- **Static Alerts**: 4 color variants with proper contrast
- **AlertBanner**: Dismissible with icons and smooth animations
- **CNC Integration**: Machine-specific alert types

### 3. Composite Components (`src/ui/components/`)

#### **Data Display**
```typescript
// Table with CNC-specific styling
<DataTable
  data={machineData}
  columns={machineColumns}
  variant="cnc" // Adds monospace fonts, status badges
  hoverable={true}
  pagination={true}
/>

// Typography showcase
<TypographyDemo
  showHeadings={true}
  showBodyText={true}
  showColors={true}
/>
```

#### **Layout Systems**
```typescript
// Responsive grid with gap control
<Grid cols={2} gap="md" responsive={true}>
  <GridItem span={2}>Header content</GridItem>
  <GridItem>Column 1</GridItem>
  <GridItem>Column 2</GridItem>
</Grid>

// Dashboard card grid
<DashboardGrid cols={4} gap="sm" minCardWidth="200px">
  {items.map(item => (
    <InteractiveCard key={item.id} onClick={item.action}>
      <CardIcon icon={item.icon} />
      <CardTitle>{item.title}</CardTitle>
      <CardDescription>{item.desc}</CardDescription>
    </InteractiveCard>
  ))}
</DashboardGrid>
```

#### **Icon System**
```typescript
// Icon showcase with consistent sizing
<IconGrid 
  icons={lucideIcons}
  size="md" // xs, sm, md, lg, xl
  interactive={true}
  showLabels={true}
  strokeWidth={1} // Our preferred thin strokes
/>
```

### 4. CNC-Specific Components (`src/ui/cnc/`)

#### **Machine Controls**
```typescript
// Jog control panel
<JogControls
  onJog={handleJog}
  onHome={handleHome}
  disabled={isEmergencyStopped}
  variant="compact" // or "expanded"
  showLabels={true}
/>

// Speed and distance controls
<JogSettings
  speed={jogSpeed}
  onSpeedChange={setJogSpeed}
  distance={jogDistance}
  onDistanceChange={setJogDistance}
  continuous={continuous}
  onContinuousChange={setContinuous}
/>
```

#### **Status & Safety**
```typescript
// Emergency controls with proper spacing
<SafetyPanel
  onEmergencyStop={handleEmergencyStop}
  isEmergencyStopped={isEmergencyStopped}
  onPause={handlePause}
  onResume={handleResume}
  size="sm" // Prevents overlap issues
/>

// Machine status with live updates
<StatusDashboard
  machines={machineList}
  showMetrics={true}
  refreshInterval={1000}
  variant="table" // or "grid"
/>
```

#### **Position Display**
```typescript
// Coordinate display with zero buttons
<CoordinateDisplay
  workPosition={position}
  machinePosition={machinePos}
  onZero={handleZero}
  precision="high" // or "standard"
  layout="vertical" // or "horizontal"
/>
```

### 5. Animation Components (`src/ui/animations/`)

#### **Page Transitions**
```typescript
<PageTransition mode="fade" duration={300}>
  <DashboardView />
</PageTransition>

<SectionTransition delay={100}>
  <ComponentSection />
</SectionTransition>

<StaggerChildren stagger={50}>
  {items.map((item, i) => (
    <AnimatedCard key={i} delay={i * 50}>
      <CardContent />
    </AnimatedCard>
  ))}
</StaggerChildren>
```

## Implementation Strategy

### Phase 1: Foundation Extraction (Week 1)
1. **Extract Design Tokens**
   - Colors, spacing, typography, border radius
   - Create CSS custom property system
   - Build utility classes for common patterns

2. **Setup Build System**
   - TypeScript compilation for components
   - CSS bundling with PostCSS
   - Component export structure

3. **Documentation Framework**
   - Setup Storybook or similar
   - Create component documentation templates
   - Establish props interface patterns

### Phase 2: Primitive Components (Week 2)
1. **Button System**
   - Extract all 10 variants from UI demo
   - Add loading states and icon composition
   - Create size system including `jog` variant

2. **Form Components**
   - Input, Select, Checkbox, Radio
   - Specialized Slider with our purple styling
   - Validation states and error handling

3. **Feedback Components**
   - Alert system with dismissible banners
   - Badge system with pulse animations
   - Loading spinners and progress indicators

### Phase 3: Layout & Composite Components (Week 3)
1. **Card System**
   - Base Card with overflow fix
   - DashboardCard with interactions
   - StatusCard for CNC applications

2. **Layout Components**
   - Grid system with responsive breakpoints
   - Container with max-width constraints
   - Sidebar with overlay and positioning

3. **Data Display**
   - Table with CNC-specific styling
   - Icon grid for showcasing
   - Typography demonstration components

### Phase 4: CNC-Specific Components (Week 4)
1. **Machine Controls**
   - JogControls with directional buttons
   - SafetyPanel with emergency stop
   - StatusDashboard with live data

2. **Position & Metrics**
   - CoordinateDisplay with precision options
   - CompactCoordinateDisplay for dashboards
   - MetricsDisplay for machine data

3. **Specialized Inputs**
   - JogSpeedControl with presets
   - JogDistanceControl with continuous mode
   - Emergency stop with warning states

## File Organization

```
src/ui/
├── foundation/
│   ├── tokens.ts              # Color, spacing, typography tokens
│   ├── animations.ts          # Animation presets and utilities
│   ├── utils.ts               # cn() function and helpers
│   └── types.ts               # Shared TypeScript interfaces
├── primitives/
│   ├── Button/
│   │   ├── Button.tsx         # Main component
│   │   ├── Button.stories.tsx # Storybook stories
│   │   ├── Button.test.tsx    # Unit tests
│   │   └── index.ts           # Exports
│   ├── Badge/
│   ├── Card/
│   ├── Alert/
│   └── Input/
├── components/
│   ├── DataTable/
│   ├── IconGrid/
│   ├── TypographyDemo/
│   └── Layout/
├── cnc/
│   ├── JogControls/
│   ├── SafetyPanel/
│   ├── StatusDashboard/
│   └── CoordinateDisplay/
├── animations/
│   ├── PageTransition/
│   ├── AnimatedCard/
│   └── StaggerChildren/
└── index.ts                   # Main library export
```

## Component API Design Principles

### 1. Consistent Props Interface
```typescript
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  variant?: string;
  size?: string;
  disabled?: boolean;
  loading?: boolean;
}
```

### 2. Composition Over Configuration
```typescript
// Good: Composable
<Card>
  <CardHeader>
    <CardTitle>Machine Status</CardTitle>
  </CardHeader>
  <CardContent>
    <StatusBadge status="running" />
  </CardContent>
</Card>

// Avoid: Too many props
<StatusCard 
  title="Machine Status" 
  status="running" 
  showHeader={true}
  headerSize="lg"
/>
```

### 3. Sensible Defaults
```typescript
// Button defaults to primary variant, medium size
<Button>Click me</Button>

// Card defaults to basic styling
<Card>
  <p>Simple content</p>
</Card>
```

## Testing Strategy

### 1. Unit Tests (Jest + React Testing Library)
- Component rendering
- Prop variations
- User interactions
- Accessibility compliance

### 2. Visual Regression Tests (Chromatic/Percy)
- Component variants
- Responsive behavior
- Animation states
- Dark theme consistency

### 3. Integration Tests (Playwright)
- Complex user flows
- CNC-specific interactions
- Form submissions
- Multi-component scenarios

## Documentation Requirements

### 1. Component Stories (Storybook)
- All variants and sizes
- Interactive controls for props
- Code examples for common use cases
- Accessibility notes

### 2. Design Guidelines
- When to use each component
- Color usage patterns
- Spacing recommendations
- Animation best practices

### 3. Migration Guide
- How to replace existing components
- Breaking changes from current implementation
- Performance considerations
- Bundle size impact

## Success Metrics

### 1. Developer Experience
- **Adoption Rate**: 90% of new features use library components
- **Development Speed**: 40% faster component implementation
- **Consistency Score**: 95% adherence to design system

### 2. Code Quality
- **Bundle Size**: <50KB gzipped for core components
- **Test Coverage**: >90% for all components
- **TypeScript**: 100% type coverage

### 3. Design Consistency
- **Visual Audit**: 100% compliance with design tokens
- **Accessibility**: AA compliance for all components
- **Browser Support**: Chrome, Firefox, Safari, Edge

## Next Steps

1. **Review and Approve Plan**: Stakeholder sign-off on architecture
2. **Setup Repository Structure**: Create organized file system
3. **Extract First Components**: Start with Button, Card, Badge
4. **Establish Documentation**: Setup Storybook and testing
5. **Create Integration Path**: Plan migration from current UI demo
6. **Performance Baseline**: Measure current bundle size and speed

This plan leverages everything we've learned and built in the UI demo while creating a scalable, maintainable component library that will serve the entire CNC application ecosystem.
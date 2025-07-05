# Migration Guide

> Comprehensive migration documentation for framework transitions and system upgrades

## Table of Contents

- [Migration Overview](#migration-overview)
- [Framework Migration](#framework-migration)
- [Component Migration](#component-migration)
- [State Management Migration](#state-management-migration)
- [Styling Migration](#styling-migration)
- [Testing Migration](#testing-migration)
- [Breaking Changes](#breaking-changes)
- [Migration Tools](#migration-tools)
- [Rollback Strategies](#rollback-strategies)
- [Best Practices](#best-practices)

---

## Migration Overview

### Migration Philosophy

Our design system is built with migration flexibility in mind using the **Adapter Pattern**. This allows us to:

- **Gradual Migration**: Replace components incrementally
- **Risk Mitigation**: Test and validate changes in isolation
- **Backward Compatibility**: Maintain existing functionality during transition
- **Framework Agnostic**: Support multiple UI frameworks simultaneously

### Migration Timeline

```
Phase 1: Assessment (1-2 weeks)
├── Audit current component usage
├── Identify migration priorities
└── Create migration plan

Phase 2: Preparation (2-3 weeks)
├── Set up new framework
├── Create component adapters
├── Implement migration tools
└── Set up testing infrastructure

Phase 3: Incremental Migration (4-8 weeks)
├── Migrate core components
├── Update application code
├── Test thoroughly
└── Monitor performance

Phase 4: Cleanup (1-2 weeks)
├── Remove legacy code
├── Update documentation
└── Performance optimization
```

---

## Framework Migration

### From Ant Design to Material-UI

#### 1. Assessment Phase

```typescript
// migration-assessment.ts
import { ComponentUsageAnalyzer } from './tools/analyzer';

const analyzer = new ComponentUsageAnalyzer('./src');
const report = analyzer.generateReport();

// Example report output:
/*
{
  totalComponents: 156,
  antdComponents: {
    Button: 45,
    Input: 32,
    Card: 28,
    Modal: 15,
    // ...
  },
  customComponents: 36,
  migrationComplexity: 'medium'
}
*/
```

#### 2. Component Mapping

```typescript
// migration-mapping.ts
export const componentMapping = {
  // Direct mappings
  'antd/Button': '@mui/material/Button',
  'antd/Input': '@mui/material/TextField',
  'antd/Card': '@mui/material/Card',
  
  // Complex mappings (require adaptation)
  'antd/DatePicker': {
    component: '@mui/x-date-pickers/DatePicker',
    adapter: './adapters/DatePickerAdapter',
    notes: 'Requires @mui/x-date-pickers package'
  },
  
  // Custom implementations needed
  'antd/Transfer': {
    component: './components/TransferList',
    notes: 'No direct MUI equivalent, custom implementation required'
  }
};
```

#### 3. Adapter Implementation

```typescript
// adapters/mui/Button.tsx
import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material/Button';
import { BaseButtonProps } from '../../interfaces/Button';

// Map our interface to MUI props
const mapVariantToMui = (variant: BaseButtonProps['variant']): MuiButtonProps['variant'] => {
  const variantMap = {
    primary: 'contained',
    secondary: 'outlined',
    emergency: 'contained', // Will use custom styling
  } as const;
  
  return variantMap[variant] || 'contained';
};

const mapSizeToMui = (size: BaseButtonProps['size']): MuiButtonProps['size'] => {
  const sizeMap = {
    sm: 'small',
    md: 'medium',
    lg: 'large',
  } as const;
  
  return sizeMap[size] || 'medium';
};

export const Button = React.forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ variant = 'primary', size = 'md', disabled, loading, children, onClick, ...props }, ref) => {
    return (
      <MuiButton
        ref={ref}
        variant={mapVariantToMui(variant)}
        size={mapSizeToMui(size)}
        disabled={disabled || loading}
        onClick={onClick}
        sx={{
          // Emergency variant styling
          ...(variant === 'emergency' && {
            backgroundColor: '#ff1744',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#d50000',
            },
          }),
        }}
        {...props}
      >
        {loading && <CircularProgress size={16} sx={{ mr: 1 }} />}
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';
```

#### 4. Provider Configuration

```typescript
// providers/MuiProvider.tsx
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Create theme matching our design tokens
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1890ff',
      dark: '#002766',
      light: '#e6f7ff',
    },
    error: {
      main: '#ff1744',
    },
    background: {
      default: '#141414',
      paper: '#1f1f1f',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a6a6a6',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
        },
      },
    },
  },
});

export const MuiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
```

#### 5. Migration Script

```typescript
// scripts/migrate-to-mui.ts
import { Project } from 'ts-morph';
import { componentMapping } from '../migration-mapping';

class AntdToMuiMigrator {
  private project: Project;
  
  constructor(tsConfigPath: string) {
    this.project = new Project({
      tsConfigFilePath: tsConfigPath,
    });
  }
  
  async migrateComponent(componentName: string): Promise<void> {
    const sourceFiles = this.project.getSourceFiles();
    
    for (const sourceFile of sourceFiles) {
      // Find all imports of the component
      const importDeclarations = sourceFile.getImportDeclarations();
      
      for (const importDecl of importDeclarations) {
        const moduleSpecifier = importDecl.getModuleSpecifierValue();
        
        if (moduleSpecifier === 'antd' || moduleSpecifier.startsWith('antd/')) {
          const namedImports = importDecl.getNamedImports();
          
          for (const namedImport of namedImports) {
            const importName = namedImport.getName();
            
            if (importName === componentName) {
              // Update import
              const mapping = componentMapping[`antd/${componentName}`];
              if (typeof mapping === 'string') {
                importDecl.setModuleSpecifier(mapping);
              } else {
                // Complex mapping - requires manual intervention
                console.log(`Complex mapping required for ${componentName} in ${sourceFile.getFilePath()}`);
              }
            }
          }
        }
      }
      
      // Update component usage if needed
      this.updateComponentUsage(sourceFile, componentName);
    }
    
    await this.project.save();
  }
  
  private updateComponentUsage(sourceFile: any, componentName: string): void {
    // Find and update component props that might have changed
    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
    
    for (const element of jsxElements) {
      const tagName = element.getTagNameNode().getText();
      
      if (tagName === componentName) {
        // Update props based on mapping rules
        this.updateComponentProps(element, componentName);
      }
    }
  }
  
  private updateComponentProps(element: any, componentName: string): void {
    // Component-specific prop migrations
    switch (componentName) {
      case 'Button':
        this.migrateButtonProps(element);
        break;
      case 'Input':
        this.migrateInputProps(element);
        break;
      // Add other component migrations
    }
  }
  
  private migrateButtonProps(element: any): void {
    const attributes = element.getAttributes();
    
    for (const attr of attributes) {
      const name = attr.getName();
      
      // Migrate 'type' prop to 'variant'
      if (name === 'type') {
        const value = attr.getInitializer()?.getText();
        if (value === '"primary"') {
          attr.set({ name: 'variant', initializer: '"contained"' });
        }
      }
    }
  }
}

// Usage
const migrator = new AntdToMuiMigrator('./tsconfig.json');
await migrator.migrateComponent('Button');
```

### From Ant Design to Chakra UI

#### Component Adapter Example

```typescript
// adapters/chakra/Button.tsx
import React from 'react';
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { BaseButtonProps } from '../../interfaces/Button';

const mapVariantToChakra = (variant: BaseButtonProps['variant']): ChakraButtonProps['variant'] => {
  const variantMap = {
    primary: 'solid',
    secondary: 'outline',
    emergency: 'solid', // Custom colorScheme
  } as const;
  
  return variantMap[variant] || 'solid';
};

const mapSizeToChakra = (size: BaseButtonProps['size']): ChakraButtonProps['size'] => {
  const sizeMap = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  } as const;
  
  return sizeMap[size] || 'md';
};

export const Button = React.forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ variant = 'primary', size = 'md', disabled, loading, children, onClick, ...props }, ref) => {
    const colorScheme = variant === 'emergency' ? 'red' : 'blue';
    
    return (
      <ChakraButton
        ref={ref}
        variant={mapVariantToChakra(variant)}
        size={mapSizeToChakra(size)}
        colorScheme={colorScheme}
        isDisabled={disabled}
        isLoading={loading}
        onClick={onClick}
        {...props}
      >
        {children}
      </ChakraButton>
    );
  }
);
```

---

## Component Migration

### Individual Component Migration

#### Button Migration

```typescript
// Before (Ant Design)
import { Button } from 'antd';

<Button type="primary" size="large" loading={isLoading}>
  Save Changes
</Button>

// After (Design System)
import { Button } from '@/ui/adapters/current/Button';

<Button variant="primary" size="lg" loading={isLoading}>
  Save Changes
</Button>
```

#### Form Migration

```typescript
// Before (Ant Design)
import { Form, Input, Button } from 'antd';

const [form] = Form.useForm();

<Form form={form} onFinish={handleSubmit}>
  <Form.Item name="name" rules={[{ required: true }]}>
    <Input placeholder="Machine name" />
  </Form.Item>
  <Form.Item>
    <Button type="primary" htmlType="submit">
      Save
    </Button>
  </Form.Item>
</Form>

// After (Design System)
import { Form, Input, Button } from '@/ui/components';
import { useForm } from '@/hooks/useForm';

const { register, handleSubmit, errors } = useForm({
  name: { required: true }
});

<Form onSubmit={handleSubmit(onSubmit)}>
  <Input
    {...register('name')}
    placeholder="Machine name"
    error={errors.name?.message}
  />
  <Button type="submit" variant="primary">
    Save
  </Button>
</Form>
```

### CNC-Specific Component Migration

#### JogControls Migration

```typescript
// Before (Custom Ant Design implementation)
import { Button, InputNumber } from 'antd';

const JogControls = () => {
  return (
    <div>
      <InputNumber value={stepSize} onChange={setStepSize} />
      <Button onClick={() => jog('X', -1)}>X-</Button>
      <Button onClick={() => jog('X', 1)}>X+</Button>
    </div>
  );
};

// After (Design System)
import { JogControls } from '@/ui/components/CNC/JogControls';

<JogControls
  position={machinePosition}
  stepSizes={[0.1, 1, 10]}
  onJog={handleJog}
  onHome={handleHome}
  disabled={!isConnected}
  workingArea={machineConfig.workingArea}
/>
```

---

## State Management Migration

### From Redux to Zustand

#### Store Migration

```typescript
// Before (Redux)
// reducers/machineReducer.ts
interface MachineState {
  position: Position3D;
  isConnected: boolean;
  status: MachineStatus;
}

const initialState: MachineState = {
  position: { x: 0, y: 0, z: 0 },
  isConnected: false,
  status: 'disconnected',
};

export const machineReducer = (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case 'UPDATE_POSITION':
      return { ...state, position: action.payload };
    case 'SET_CONNECTION':
      return { ...state, isConnected: action.payload };
    default:
      return state;
  }
};

// After (Zustand)
// stores/machineStore.ts
interface MachineStore {
  machine: {
    position: Position3D;
    isConnected: boolean;
    status: MachineStatus;
  };
  updatePosition: (position: Position3D) => void;
  setConnection: (connected: boolean) => void;
}

export const useMachineStore = create<MachineStore>()((set) => ({
  machine: {
    position: { x: 0, y: 0, z: 0 },
    isConnected: false,
    status: 'disconnected',
  },
  updatePosition: (position) =>
    set((state) => ({
      machine: { ...state.machine, position },
    })),
  setConnection: (isConnected) =>
    set((state) => ({
      machine: { ...state.machine, isConnected },
    })),
}));
```

#### Component Usage Migration

```typescript
// Before (Redux)
import { useSelector, useDispatch } from 'react-redux';
import { updatePosition } from '../actions/machineActions';

const PositionDisplay = () => {
  const position = useSelector((state: RootState) => state.machine.position);
  const dispatch = useDispatch();
  
  const handlePositionChange = (newPosition: Position3D) => {
    dispatch(updatePosition(newPosition));
  };
  
  return <div>Position: {position.x}, {position.y}, {position.z}</div>;
};

// After (Zustand)
import { useMachineStore } from '../stores/machineStore';

const PositionDisplay = () => {
  const { machine, updatePosition } = useMachineStore();
  
  const handlePositionChange = (newPosition: Position3D) => {
    updatePosition(newPosition);
  };
  
  return <div>Position: {machine.position.x}, {machine.position.y}, {machine.position.z}</div>;
};
```

### Migration Script for State Management

```typescript
// scripts/migrate-redux-to-zustand.ts
import { Project, SyntaxKind } from 'ts-morph';

class ReduxToZustandMigrator {
  private project: Project;
  
  constructor(tsConfigPath: string) {
    this.project = new Project({ tsConfigFilePath: tsConfigPath });
  }
  
  async migrateSelectors(): Promise<void> {
    const sourceFiles = this.project.getSourceFiles();
    
    for (const sourceFile of sourceFiles) {
      // Find useSelector calls
      const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
      
      for (const callExpr of callExpressions) {
        const expression = callExpr.getExpression();
        
        if (expression.getText() === 'useSelector') {
          // Replace with Zustand store usage
          this.replaceUseSelector(callExpr);
        }
      }
      
      // Find useDispatch calls
      this.replaceUseDispatch(sourceFile);
    }
    
    await this.project.save();
  }
  
  private replaceUseSelector(callExpr: any): void {
    const args = callExpr.getArguments();
    if (args.length > 0) {
      const selectorArg = args[0];
      
      // Parse selector to determine store and property
      const selectorText = selectorArg.getText();
      
      // Example: (state: RootState) => state.machine.position
      // Should become: useMachineStore((state) => state.machine.position)
      
      const storeMatch = selectorText.match(/state\.(\w+)/);
      if (storeMatch) {
        const storeName = storeMatch[1];
        const newCall = `use${capitalize(storeName)}Store(${selectorText.replace('state: RootState', 'state')})`;
        
        callExpr.replaceWithText(newCall);
        
        // Add import if not present
        this.addStoreImport(callExpr.getSourceFile(), storeName);
      }
    }
  }
  
  private replaceUseDispatch(sourceFile: any): void {
    // Replace dispatch calls with direct store method calls
    const dispatchCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter((call: any) => call.getExpression().getText() === 'dispatch');
    
    for (const dispatchCall of dispatchCalls) {
      const args = dispatchCall.getArguments();
      if (args.length > 0) {
        const actionCall = args[0];
        
        // Convert action to store method call
        this.convertActionToStoreMethod(dispatchCall, actionCall);
      }
    }
  }
}
```

---

## Styling Migration

### From CSS Modules to Tailwind

#### Component Style Migration

```typescript
// Before (CSS Modules)
// Button.module.css
.button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary {
  background-color: #1890ff;
  color: white;
}

.primary:hover {
  background-color: #40a9ff;
}

.secondary {
  background-color: transparent;
  color: #1890ff;
  border: 1px solid #1890ff;
}

// Button.tsx
import styles from './Button.module.css';

const Button = ({ variant, children }) => {
  const className = `${styles.button} ${styles[variant]}`;
  return <button className={className}>{children}</button>;
};

// After (Tailwind + CVA)
// Button.tsx
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'px-4 py-2 rounded-md border-none cursor-pointer transition-all duration-200',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-500',
        secondary: 'bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

const Button = ({ variant, className, children, ...props }) => {
  return (
    <button
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    >
      {children}
    </button>
  );
};
```

### Migration Script for Styles

```typescript
// scripts/migrate-css-to-tailwind.ts
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

interface CSSRule {
  selector: string;
  properties: Record<string, string>;
}

class CSSToTailwindMigrator {
  private cssPropertyMap: Record<string, string> = {
    'padding': 'p-',
    'padding-top': 'pt-',
    'padding-bottom': 'pb-',
    'padding-left': 'pl-',
    'padding-right': 'pr-',
    'margin': 'm-',
    'background-color': 'bg-',
    'color': 'text-',
    'border-radius': 'rounded-',
    'display': '',
    'flex-direction': 'flex-',
    'justify-content': 'justify-',
    'align-items': 'items-',
    // Add more mappings...
  };
  
  async migrateCSSFiles(): Promise<void> {
    const cssFiles = glob.sync('**/*.module.css');
    
    for (const cssFile of cssFiles) {
      const content = readFileSync(cssFile, 'utf-8');
      const rules = this.parseCSSRules(content);
      
      const tailwindClasses = this.convertToTailwind(rules);
      const cvaConfig = this.generateCVAConfig(tailwindClasses);
      
      // Write new component file
      const componentFile = cssFile.replace('.module.css', '.tailwind.ts');
      writeFileSync(componentFile, cvaConfig);
      
      console.log(`Migrated ${cssFile} to ${componentFile}`);
    }
  }
  
  private parseCSSRules(css: string): CSSRule[] {
    // Simple CSS parser (in production, use a proper CSS parser)
    const rules: CSSRule[] = [];
    const ruleRegex = /\.([^{]+)\s*\{([^}]+)\}/g;
    
    let match;
    while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      const propertiesText = match[2];
      
      const properties: Record<string, string> = {};
      const propRegex = /([^:]+):\s*([^;]+);/g;
      
      let propMatch;
      while ((propMatch = propRegex.exec(propertiesText)) !== null) {
        const property = propMatch[1].trim();
        const value = propMatch[2].trim();
        properties[property] = value;
      }
      
      rules.push({ selector, properties });
    }
    
    return rules;
  }
  
  private convertToTailwind(rules: CSSRule[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    
    for (const rule of rules) {
      const tailwindClasses: string[] = [];
      
      for (const [property, value] of Object.entries(rule.properties)) {
        const tailwindClass = this.convertPropertyToTailwind(property, value);
        if (tailwindClass) {
          tailwindClasses.push(tailwindClass);
        }
      }
      
      result[rule.selector] = tailwindClasses;
    }
    
    return result;
  }
  
  private convertPropertyToTailwind(property: string, value: string): string | null {
    const mapping = this.cssPropertyMap[property];
    if (!mapping) return null;
    
    // Convert specific values to Tailwind classes
    switch (property) {
      case 'padding':
        return this.convertSpacing('p', value);
      case 'margin':
        return this.convertSpacing('m', value);
      case 'background-color':
        return this.convertColor('bg', value);
      case 'color':
        return this.convertColor('text', value);
      // Add more conversions...
      default:
        return null;
    }
  }
  
  private convertSpacing(prefix: string, value: string): string {
    const spacingMap: Record<string, string> = {
      '4px': '1',
      '8px': '2',
      '12px': '3',
      '16px': '4',
      '20px': '5',
      '24px': '6',
      // Add more mappings...
    };
    
    return `${prefix}-${spacingMap[value] || '[' + value + ']'}`;
  }
  
  private convertColor(prefix: string, value: string): string {
    const colorMap: Record<string, string> = {
      '#1890ff': 'blue-600',
      '#40a9ff': 'blue-500',
      '#ffffff': 'white',
      '#000000': 'black',
      // Add more mappings...
    };
    
    return `${prefix}-${colorMap[value] || '[' + value + ']'}`;
  }
  
  private generateCVAConfig(classes: Record<string, string[]>): string {
    const baseClasses = classes['button'] || [];
    const variants: Record<string, string[]> = {};
    
    for (const [selector, classList] of Object.entries(classes)) {
      if (selector !== 'button') {
        variants[selector] = classList;
      }
    }
    
    return `
import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  '${baseClasses.join(' ')}',
  {
    variants: {
      variant: {
        ${Object.entries(variants)
          .map(([key, classes]) => `${key}: '${classes.join(' ')}'`)
          .join(',\n        ')}
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);
`;
  }
}
```

---

## Testing Migration

### From Enzyme to React Testing Library

```typescript
// Before (Enzyme)
import { shallow, mount } from 'enzyme';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<Button>Click me</Button>);
    expect(wrapper.text()).toBe('Click me');
  });
  
  it('handles click events', () => {
    const onClick = jest.fn();
    const wrapper = mount(<Button onClick={onClick}>Click me</Button>);
    
    wrapper.find('button').simulate('click');
    expect(onClick).toHaveBeenCalled();
  });
  
  it('has correct class when disabled', () => {
    const wrapper = shallow(<Button disabled>Disabled</Button>);
    expect(wrapper.hasClass('disabled')).toBe(true);
  });
});

// After (React Testing Library)
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('handles click events', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    
    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByText('Click me'));
    
    expect(onClick).toHaveBeenCalled();
  });
  
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});
```

---

## Breaking Changes

### Version 2.0.0 Breaking Changes

#### Component API Changes

```typescript
// BREAKING: Button component prop changes
// Before v2.0.0
<Button type="primary" size="large">Save</Button>

// After v2.0.0
<Button variant="primary" size="lg">Save</Button>

// BREAKING: Input component validation changes
// Before v2.0.0
<Input status="error" />

// After v2.0.0
<Input error="This field is required" />

// BREAKING: Modal component prop changes
// Before v2.0.0
<Modal visible={true} onCancel={handleClose}>

// After v2.0.0
<Modal open={true} onClose={handleClose}>
```

#### Store API Changes

```typescript
// BREAKING: Machine store structure changes
// Before v2.0.0
const { position, isConnected } = useMachineStore();

// After v2.0.0
const { machine } = useMachineStore();
const { position, isConnected } = machine;

// BREAKING: Action naming changes
// Before v2.0.0
machineStore.setPosition(newPosition);

// After v2.0.0
machineStore.updatePosition(newPosition);
```

### Migration Scripts for Breaking Changes

```typescript
// scripts/migrate-v2-breaking-changes.ts
import { Project, SyntaxKind } from 'ts-morph';

class V2MigrationScript {
  private project: Project;
  
  constructor() {
    this.project = new Project({
      tsConfigFilePath: './tsconfig.json',
    });
  }
  
  async migrateAll(): Promise<void> {
    await this.migrateButtonProps();
    await this.migrateInputProps();
    await this.migrateModalProps();
    await this.migrateStoreUsage();
    await this.project.save();
  }
  
  private async migrateButtonProps(): Promise<void> {
    const sourceFiles = this.project.getSourceFiles();
    
    for (const sourceFile of sourceFiles) {
      const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
      
      for (const element of jsxElements) {
        if (element.getTagNameNode().getText() === 'Button') {
          const attributes = element.getAttributes();
          
          for (const attr of attributes) {
            const name = attr.getName();
            
            if (name === 'type') {
              attr.set({ name: 'variant' });
            }
            
            if (name === 'size') {
              const value = attr.getInitializer()?.getText();
              if (value === '"large"') {
                attr.getInitializer()?.replaceWithText('"lg"');
              } else if (value === '"small"') {
                attr.getInitializer()?.replaceWithText('"sm"');
              }
            }
          }
        }
      }
    }
  }
  
  // Add more migration methods...
}

// Run migration
const migrator = new V2MigrationScript();
await migrator.migrateAll();
```

---

## Migration Tools

### Component Usage Analyzer

```typescript
// tools/component-analyzer.ts
import { Project, SyntaxKind } from 'ts-morph';
import { writeFileSync } from 'fs';

export class ComponentUsageAnalyzer {
  private project: Project;
  
  constructor(sourceDir: string) {
    this.project = new Project({
      tsConfigFilePath: './tsconfig.json',
    });
    this.project.addSourceFilesAtPaths(`${sourceDir}/**/*.{ts,tsx}`);
  }
  
  generateUsageReport(): ComponentUsageReport {
    const report: ComponentUsageReport = {
      totalFiles: 0,
      componentUsage: {},
      importSources: {},
      migrationComplexity: 'low',
    };
    
    const sourceFiles = this.project.getSourceFiles();
    report.totalFiles = sourceFiles.length;
    
    for (const sourceFile of sourceFiles) {
      this.analyzeFile(sourceFile, report);
    }
    
    report.migrationComplexity = this.calculateComplexity(report);
    
    return report;
  }
  
  private analyzeFile(sourceFile: any, report: ComponentUsageReport): void {
    // Analyze imports
    const imports = sourceFile.getImportDeclarations();
    
    for (const importDecl of imports) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      
      if (moduleSpecifier === 'antd' || moduleSpecifier.startsWith('antd/')) {
        const namedImports = importDecl.getNamedImports();
        
        for (const namedImport of namedImports) {
          const componentName = namedImport.getName();
          
          if (!report.componentUsage[componentName]) {
            report.componentUsage[componentName] = 0;
          }
          
          if (!report.importSources[moduleSpecifier]) {
            report.importSources[moduleSpecifier] = 0;
          }
          
          report.importSources[moduleSpecifier]++;
        }
      }
    }
    
    // Analyze JSX usage
    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
    
    for (const element of jsxElements) {
      const tagName = element.getTagNameNode().getText();
      
      if (report.componentUsage.hasOwnProperty(tagName)) {
        report.componentUsage[tagName]++;
      }
    }
  }
  
  private calculateComplexity(report: ComponentUsageReport): 'low' | 'medium' | 'high' {
    const totalUsage = Object.values(report.componentUsage).reduce((sum, count) => sum + count, 0);
    const uniqueComponents = Object.keys(report.componentUsage).length;
    
    if (totalUsage > 200 || uniqueComponents > 15) {
      return 'high';
    } else if (totalUsage > 50 || uniqueComponents > 8) {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  exportReport(report: ComponentUsageReport, filename: string = 'migration-report.json'): void {
    writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`Migration report exported to ${filename}`);
  }
}

interface ComponentUsageReport {
  totalFiles: number;
  componentUsage: Record<string, number>;
  importSources: Record<string, number>;
  migrationComplexity: 'low' | 'medium' | 'high';
}
```

### Automated Migration CLI

```typescript
// tools/migration-cli.ts
import { Command } from 'commander';
import { ComponentUsageAnalyzer } from './component-analyzer';
import { AntdToMuiMigrator } from './migrators/antd-to-mui';

const program = new Command();

program
  .name('design-system-migrator')
  .description('CLI tool for migrating between UI frameworks')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze current component usage')
  .option('-s, --source <path>', 'Source directory', './src')
  .option('-o, --output <file>', 'Output file', 'migration-report.json')
  .action((options) => {
    const analyzer = new ComponentUsageAnalyzer(options.source);
    const report = analyzer.generateUsageReport();
    analyzer.exportReport(report, options.output);
    
    console.log('Analysis complete:');
    console.log(`- Total files: ${report.totalFiles}`);
    console.log(`- Components found: ${Object.keys(report.componentUsage).length}`);
    console.log(`- Migration complexity: ${report.migrationComplexity}`);
  });

program
  .command('migrate')
  .description('Migrate components to new framework')
  .requiredOption('-f, --from <framework>', 'Source framework (antd)')
  .requiredOption('-t, --to <framework>', 'Target framework (mui, chakra)')
  .option('-c, --component <name>', 'Specific component to migrate')
  .option('--dry-run', 'Preview changes without applying them')
  .action(async (options) => {
    if (options.from === 'antd' && options.to === 'mui') {
      const migrator = new AntdToMuiMigrator('./tsconfig.json');
      
      if (options.component) {
        await migrator.migrateComponent(options.component);
        console.log(`Migrated ${options.component} from Ant Design to Material-UI`);
      } else {
        await migrator.migrateAll();
        console.log('Full migration completed');
      }
    } else {
      console.error(`Migration from ${options.from} to ${options.to} not supported yet`);
    }
  });

program
  .command('validate')
  .description('Validate migration results')
  .option('-s, --source <path>', 'Source directory', './src')
  .action((options) => {
    // Run validation checks
    console.log('Running migration validation...');
    // Implementation here
  });

program.parse();
```

---

## Rollback Strategies

### Git-Based Rollback

```bash
# Create migration branch
git checkout -b migration/antd-to-mui

# Perform migration
npm run migrate -- --from antd --to mui

# Test migration
npm test
npm run e2e

# If issues found, rollback
git checkout main
git branch -D migration/antd-to-mui

# If successful, merge
git checkout main
git merge migration/antd-to-mui
```

### Component-Level Rollback

```typescript
// Rollback specific components while keeping others migrated
// ComponentProvider.tsx
import { Button as AntdButton } from 'antd';
import { Button as MuiButton } from '@/ui/adapters/mui/Button';

const componentMap = {
  antd: {
    Button: AntdButton,
  },
  mui: {
    Button: MuiButton,
  },
};

export const ComponentProvider: React.FC<{
  implementation: 'antd' | 'mui';
  rollbackComponents?: string[];
  children: React.ReactNode;
}> = ({ implementation, rollbackComponents = [], children }) => {
  const context = {
    Button: rollbackComponents.includes('Button') 
      ? componentMap.antd.Button 
      : componentMap[implementation].Button,
  };
  
  return (
    <ComponentContext.Provider value={context}>
      {children}
    </ComponentContext.Provider>
  );
};

// Usage
<ComponentProvider 
  implementation="mui" 
  rollbackComponents={['Button']} // Rollback Button to Ant Design
>
  <App />
</ComponentProvider>
```

### Feature Flag Rollback

```typescript
// Feature flag for gradual rollout
export const useFeatureFlag = (flag: string): boolean => {
  const flags = {
    'mui-migration': process.env.NODE_ENV === 'development' || 
                     window.localStorage.getItem('enableMuiMigration') === 'true',
    'new-jog-controls': true,
  };
  
  return flags[flag] || false;
};

// Component usage
const ControlsPage = () => {
  const useMuiComponents = useFeatureFlag('mui-migration');
  
  return (
    <ComponentProvider implementation={useMuiComponents ? 'mui' : 'antd'}>
      <JogControls />
    </ComponentProvider>
  );
};
```

---

## Best Practices

### Migration Planning

1. **Start Small**: Begin with leaf components (no dependencies)
2. **Test Thoroughly**: Validate each component before moving to the next
3. **Document Changes**: Keep detailed migration logs
4. **Use Feature Flags**: Enable gradual rollout and easy rollback
5. **Monitor Performance**: Watch for regressions during migration

### Risk Mitigation

1. **Backup Strategy**: Always work in feature branches
2. **Automated Testing**: Ensure comprehensive test coverage
3. **User Acceptance Testing**: Validate with actual users
4. **Performance Monitoring**: Track metrics during migration
5. **Rollback Plan**: Have clear rollback procedures

### Team Coordination

1. **Communication**: Keep team informed of migration progress
2. **Code Reviews**: Require thorough reviews for migration PRs
3. **Training**: Ensure team understands new frameworks/patterns
4. **Documentation**: Update all relevant documentation
5. **Knowledge Sharing**: Conduct migration retrospectives

### Post-Migration

1. **Cleanup**: Remove old dependencies and unused code
2. **Documentation Update**: Update all technical documentation
3. **Performance Review**: Analyze impact on application performance
4. **Team Feedback**: Gather lessons learned for future migrations
5. **Monitoring Setup**: Establish ongoing monitoring for new system

---

**Migrate with confidence! 🚀**
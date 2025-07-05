# Developer Tools & CLI Utilities

> Development tools and command-line utilities for the CNC Control Design System

## Table of Contents

- [Overview](#overview)
- [Design System CLI](#design-system-cli)
- [Component Generator](#component-generator)
- [Migration Tools](#migration-tools)
- [Code Analysis](#code-analysis)
- [Performance Tools](#performance-tools)
- [Testing Utilities](#testing-utilities)
- [Build Tools](#build-tools)
- [VS Code Extensions](#vs-code-extensions)
- [Development Scripts](#development-scripts)

---

## Overview

The CNC Control Design System includes a comprehensive suite of developer tools to streamline development, maintain code quality, and ensure consistency across the codebase.

### Tool Categories

- **CLI Tools**: Command-line utilities for common development tasks
- **Generators**: Automated component and story generation
- **Analysis Tools**: Code quality and usage analysis
- **Migration Utilities**: Framework migration and upgrade tools
- **Performance Tools**: Bundle analysis and optimization
- **Testing Utilities**: Test generation and validation

---

## Design System CLI

### Installation

```bash
# Install the design system CLI globally
npm install -g @cnc/design-system-cli

# Or use locally
npx @cnc/design-system-cli
```

### Core Commands

```bash
# Display help
ds-cli --help

# Create new component
ds-cli generate component Button

# Create new CNC component
ds-cli generate cnc-component JogControls

# Analyze component usage
ds-cli analyze usage

# Run migrations
ds-cli migrate --from antd --to mui

# Validate design tokens
ds-cli validate tokens

# Generate documentation
ds-cli docs generate
```

### CLI Implementation

```typescript
// tools/cli/index.ts
#!/usr/bin/env node

import { Command } from 'commander';
import { ComponentGenerator } from './generators/ComponentGenerator';
import { UsageAnalyzer } from './analyzers/UsageAnalyzer';
import { MigrationRunner } from './migrators/MigrationRunner';
import { TokenValidator } from './validators/TokenValidator';

const program = new Command();

program
  .name('ds-cli')
  .description('CNC Design System CLI')
  .version('1.0.0');

// Generate command
program
  .command('generate <type> <name>')
  .alias('g')
  .description('Generate components, stories, or tests')
  .option('-t, --template <template>', 'Template to use', 'default')
  .option('-d, --directory <dir>', 'Output directory', './src/components')
  .option('--dry-run', 'Preview changes without creating files')
  .action(async (type, name, options) => {
    const generator = new ComponentGenerator();
    
    switch (type) {
      case 'component':
        await generator.generateComponent(name, options);
        break;
      case 'cnc-component':
        await generator.generateCNCComponent(name, options);
        break;
      case 'story':
        await generator.generateStory(name, options);
        break;
      default:
        console.error(`Unknown type: ${type}`);
    }
  });

// Analyze command
program
  .command('analyze <target>')
  .description('Analyze codebase')
  .option('-o, --output <file>', 'Output file', 'analysis.json')
  .option('-f, --format <format>', 'Output format', 'json')
  .action(async (target, options) => {
    const analyzer = new UsageAnalyzer();
    
    switch (target) {
      case 'usage':
        await analyzer.analyzeComponentUsage(options);
        break;
      case 'performance':
        await analyzer.analyzePerformance(options);
        break;
      case 'accessibility':
        await analyzer.analyzeAccessibility(options);
        break;
      default:
        console.error(`Unknown target: ${target}`);
    }
  });

// Migrate command
program
  .command('migrate')
  .description('Run migration scripts')
  .option('-f, --from <framework>', 'Source framework')
  .option('-t, --to <framework>', 'Target framework')
  .option('-c, --component <name>', 'Specific component')
  .option('--dry-run', 'Preview changes')
  .action(async (options) => {
    const migrator = new MigrationRunner();
    await migrator.run(options);
  });

// Validate command
program
  .command('validate <target>')
  .description('Validate design system elements')
  .option('-f, --fix', 'Automatically fix issues')
  .action(async (target, options) => {
    const validator = new TokenValidator();
    
    switch (target) {
      case 'tokens':
        await validator.validateTokens(options);
        break;
      case 'components':
        await validator.validateComponents(options);
        break;
      case 'accessibility':
        await validator.validateAccessibility(options);
        break;
      default:
        console.error(`Unknown target: ${target}`);
    }
  });

program.parse();
```

---

## Component Generator

### Basic Component Generation

```bash
# Generate basic component
ds-cli generate component Button

# Generate with TypeScript interface
ds-cli generate component Input --template typescript

# Generate CNC-specific component
ds-cli generate cnc-component JogControls --template cnc
```

### Generator Implementation

```typescript
// tools/generators/ComponentGenerator.ts
import { promises as fs } from 'fs';
import { join } from 'path';
import { pascalCase, camelCase, kebabCase } from 'change-case';

export class ComponentGenerator {
  private templates = new Map<string, ComponentTemplate>();
  
  constructor() {
    this.loadTemplates();
  }
  
  async generateComponent(name: string, options: GeneratorOptions): Promise<void> {
    const template = this.templates.get(options.template || 'default');
    if (!template) {
      throw new Error(`Template not found: ${options.template}`);
    }
    
    const componentData = {
      name: pascalCase(name),
      nameCamel: camelCase(name),
      nameKebab: kebabCase(name),
      timestamp: new Date().toISOString(),
    };
    
    const files = template.generateFiles(componentData);
    
    if (options.dryRun) {
      console.log('Files that would be created:');
      files.forEach(file => console.log(`  ${file.path}`));
      return;
    }
    
    await this.writeFiles(files, options.directory);
    console.log(`✅ Component ${name} created successfully`);
  }
  
  async generateCNCComponent(name: string, options: GeneratorOptions): Promise<void> {
    const template = this.templates.get('cnc');
    if (!template) {
      throw new Error('CNC template not found');
    }
    
    await this.generateComponent(name, { ...options, template: 'cnc' });
  }
  
  private async writeFiles(files: GeneratedFile[], baseDir: string): Promise<void> {
    for (const file of files) {
      const fullPath = join(baseDir, file.path);
      const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
      
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, file.content);
    }
  }
  
  private loadTemplates(): void {
    this.templates.set('default', new DefaultComponentTemplate());
    this.templates.set('cnc', new CNCComponentTemplate());
    this.templates.set('typescript', new TypeScriptComponentTemplate());
  }
}

// Component templates
abstract class ComponentTemplate {
  abstract generateFiles(data: ComponentData): GeneratedFile[];
  
  protected renderTemplate(template: string, data: ComponentData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key as keyof ComponentData] || match;
    });
  }
}

class DefaultComponentTemplate extends ComponentTemplate {
  generateFiles(data: ComponentData): GeneratedFile[] {
    return [
      {
        path: `${data.name}/${data.name}.tsx`,
        content: this.renderTemplate(this.getComponentTemplate(), data),
      },
      {
        path: `${data.name}/${data.name}.test.tsx`,
        content: this.renderTemplate(this.getTestTemplate(), data),
      },
      {
        path: `${data.name}/${data.name}.stories.tsx`,
        content: this.renderTemplate(this.getStoryTemplate(), data),
      },
      {
        path: `${data.name}/index.ts`,
        content: `export { ${data.name} } from './${data.name}';`,
      },
    ];
  }
  
  private getComponentTemplate(): string {
    return `import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const {{nameCamel}}Variants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface {{name}}Props 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof {{nameCamel}}Variants> {
  children: React.ReactNode;
}

export const {{name}} = React.forwardRef<HTMLDivElement, {{name}}Props>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn({{nameCamel}}Variants({ variant, size }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

{{name}}.displayName = '{{name}}';`;
  }
  
  private getTestTemplate(): string {
    return `import { render, screen } from '@testing-library/react';
import { {{name}} } from './{{name}}';

describe('{{name}}', () => {
  it('renders correctly', () => {
    render(<{{name}}>Test content</{{name}}>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
  
  it('applies custom className', () => {
    render(<{{name}} className="custom-class">Test</{{name}}>);
    const element = screen.getByText('Test');
    expect(element).toHaveClass('custom-class');
  });
  
  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<{{name}} ref={ref}>Test</{{name}}>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});`;
  }
  
  private getStoryTemplate(): string {
    return `import type { Meta, StoryObj } from '@storybook/react';
import { {{name}} } from './{{name}}';

const meta: Meta<typeof {{name}}> = {
  title: 'Components/{{name}}',
  component: {{name}},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '{{name}} Component',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary {{name}}',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <{{name}} size="sm">Small</{{name}}>
      <{{name}} size="md">Medium</{{name}}>
      <{{name}} size="lg">Large</{{name}}>
    </div>
  ),
};`;
  }
}

class CNCComponentTemplate extends ComponentTemplate {
  generateFiles(data: ComponentData): GeneratedFile[] {
    const baseFiles = new DefaultComponentTemplate().generateFiles(data);
    
    // Add CNC-specific files
    baseFiles.push({
      path: `${data.name}/${data.name}.types.ts`,
      content: this.getCNCTypesTemplate(),
    });
    
    // Override component template with CNC-specific implementation
    const componentFile = baseFiles.find(f => f.path.endsWith('.tsx'));
    if (componentFile) {
      componentFile.content = this.renderTemplate(this.getCNCComponentTemplate(), data);
    }
    
    return baseFiles;
  }
  
  private getCNCComponentTemplate(): string {
    return `import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import type { Position3D, MachineStatus } from '@/types/cnc';

const {{nameCamel}}Variants = cva(
  'cnc-component rounded-lg border border-gray-700 bg-gray-800 p-4',
  {
    variants: {
      status: {
        idle: 'border-green-700 bg-green-900/20',
        running: 'border-blue-700 bg-blue-900/20',
        error: 'border-red-700 bg-red-900/20',
        emergency: 'border-red-500 bg-red-900/50',
      },
      size: {
        sm: 'p-2 text-sm',
        md: 'p-4',
        lg: 'p-6 text-lg',
      },
    },
    defaultVariants: {
      status: 'idle',
      size: 'md',
    },
  }
);

export interface {{name}}Props 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof {{nameCamel}}Variants> {
  machineStatus?: MachineStatus;
  position?: Position3D;
  disabled?: boolean;
  onAction?: (action: string, data?: any) => void;
  children: React.ReactNode;
}

export const {{name}} = React.forwardRef<HTMLDivElement, {{name}}Props>(
  ({ 
    className, 
    status = 'idle', 
    size, 
    machineStatus,
    position,
    disabled = false,
    onAction,
    children,
    ...props 
  }, ref) => {
    const handleAction = (action: string, data?: any) => {
      if (!disabled && onAction) {
        onAction(action, data);
      }
    };
    
    return (
      <div
        ref={ref}
        className={cn({{nameCamel}}Variants({ status, size }), className)}
        role="group"
        aria-label="{{name}} CNC component"
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </div>
    );
  }
);

{{name}}.displayName = '{{name}}';`;
  }
  
  private getCNCTypesTemplate(): string {
    return `// CNC-specific types for {{name}} component

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export type MachineStatus = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'idle'
  | 'running'
  | 'paused'
  | 'error'
  | 'emergency'
  | 'homing';

export interface WorkingArea {
  width: number;
  height: number;
  depth: number;
  units: 'mm' | 'in';
}

export interface SafetyLimits {
  maxFeedRate: number;
  maxSpindleSpeed: number;
  emergencyStopEnabled: boolean;
}`;
  }
}

interface ComponentData {
  name: string;
  nameCamel: string;
  nameKebab: string;
  timestamp: string;
}

interface GeneratedFile {
  path: string;
  content: string;
}

interface GeneratorOptions {
  template?: string;
  directory: string;
  dryRun?: boolean;
}
```

---

## Migration Tools

### Framework Migration CLI

```bash
# Analyze current usage
ds-cli analyze usage --output migration-report.json

# Run migration from Ant Design to Material-UI
ds-cli migrate --from antd --to mui

# Migrate specific component
ds-cli migrate --from antd --to mui --component Button

# Dry run migration
ds-cli migrate --from antd --to mui --dry-run
```

### Migration Implementation

```typescript
// tools/migrators/MigrationRunner.ts
import { ComponentUsageAnalyzer } from '../analyzers/ComponentUsageAnalyzer';
import { AntdToMuiMigrator } from './AntdToMuiMigrator';
import { CodeModRunner } from './CodeModRunner';

export class MigrationRunner {
  private migrators = new Map<string, ComponentMigrator>();
  
  constructor() {
    this.migrators.set('antd-to-mui', new AntdToMuiMigrator());
    // Add more migrators as needed
  }
  
  async run(options: MigrationOptions): Promise<void> {
    const migratorKey = `${options.from}-to-${options.to}`;
    const migrator = this.migrators.get(migratorKey);
    
    if (!migrator) {
      throw new Error(`Migration from ${options.from} to ${options.to} not supported`);
    }
    
    // Analyze current usage
    console.log('📊 Analyzing current component usage...');
    const analyzer = new ComponentUsageAnalyzer();
    const usageReport = await analyzer.generateReport();
    
    // Create migration plan
    console.log('📋 Creating migration plan...');
    const migrationPlan = migrator.createMigrationPlan(usageReport);
    
    if (options.dryRun) {
      console.log('🔍 Dry run mode - showing planned changes:');
      migrationPlan.changes.forEach(change => {
        console.log(`  ${change.type}: ${change.description}`);
      });
      return;
    }
    
    // Execute migration
    console.log('🚀 Executing migration...');
    await migrator.executeMigration(migrationPlan, options);
    
    console.log('✅ Migration completed successfully');
    console.log('📝 Next steps:');
    console.log('  1. Review changes and test your application');
    console.log('  2. Run tests: npm test');
    console.log('  3. Check for any remaining issues');
  }
}

// Base migrator interface
abstract class ComponentMigrator {
  abstract createMigrationPlan(usageReport: UsageReport): MigrationPlan;
  abstract executeMigration(plan: MigrationPlan, options: MigrationOptions): Promise<void>;
}

// Specific migrator implementation
class AntdToMuiMigrator extends ComponentMigrator {
  createMigrationPlan(usageReport: UsageReport): MigrationPlan {
    const changes: MigrationChange[] = [];
    
    // Analyze each component usage
    for (const [component, usage] of Object.entries(usageReport.componentUsage)) {
      if (this.isMigrationNeeded(component)) {
        changes.push({
          type: 'component-migration',
          component,
          usageCount: usage,
          description: `Migrate ${usage} instances of ${component} from Ant Design to Material-UI`,
          complexity: this.getComplexity(component),
        });
      }
    }
    
    return {
      changes,
      estimatedDuration: this.estimateDuration(changes),
      riskLevel: this.assessRisk(changes),
    };
  }
  
  async executeMigration(plan: MigrationPlan, options: MigrationOptions): Promise<void> {
    const codemod = new CodeModRunner();
    
    for (const change of plan.changes) {
      if (options.component && change.component !== options.component) {
        continue; // Skip if specific component requested
      }
      
      console.log(`  Migrating ${change.component}...`);
      await codemod.run(`antd-to-mui-${change.component.toLowerCase()}`);
    }
    
    // Update package.json dependencies
    await this.updateDependencies();
    
    // Generate migration report
    await this.generateMigrationReport(plan);
  }
  
  private isMigrationNeeded(component: string): boolean {
    const antdComponents = ['Button', 'Input', 'Card', 'Modal', 'Table'];
    return antdComponents.includes(component);
  }
  
  private getComplexity(component: string): 'low' | 'medium' | 'high' {
    const complexityMap: Record<string, 'low' | 'medium' | 'high'> = {
      Button: 'low',
      Input: 'medium',
      Card: 'medium',
      Modal: 'high',
      Table: 'high',
    };
    
    return complexityMap[component] || 'medium';
  }
}

interface MigrationOptions {
  from: string;
  to: string;
  component?: string;
  dryRun?: boolean;
}

interface MigrationChange {
  type: string;
  component: string;
  usageCount: number;
  description: string;
  complexity: 'low' | 'medium' | 'high';
}

interface MigrationPlan {
  changes: MigrationChange[];
  estimatedDuration: string;
  riskLevel: 'low' | 'medium' | 'high';
}
```

---

## Code Analysis

### Usage Analysis

```bash
# Analyze component usage across codebase
ds-cli analyze usage

# Performance analysis
ds-cli analyze performance

# Accessibility analysis
ds-cli analyze accessibility
```

### Analyzer Implementation

```typescript
// tools/analyzers/UsageAnalyzer.ts
import { Project, SyntaxKind } from 'ts-morph';
import { writeFileSync } from 'fs';

export class UsageAnalyzer {
  private project: Project;
  
  constructor(tsConfigPath: string = './tsconfig.json') {
    this.project = new Project({
      tsConfigFilePath: tsConfigPath,
    });
  }
  
  async analyzeComponentUsage(options: AnalysisOptions): Promise<UsageReport> {
    const sourceFiles = this.project.getSourceFiles();
    const report: UsageReport = {
      totalFiles: sourceFiles.length,
      componentUsage: {},
      importSources: {},
      unusedComponents: [],
      migrationComplexity: 'low',
      recommendations: [],
    };
    
    for (const sourceFile of sourceFiles) {
      this.analyzeFile(sourceFile, report);
    }
    
    report.migrationComplexity = this.calculateComplexity(report);
    report.recommendations = this.generateRecommendations(report);
    
    if (options.output) {
      this.exportReport(report, options.output, options.format || 'json');
    }
    
    return report;
  }
  
  async analyzePerformance(options: AnalysisOptions): Promise<PerformanceReport> {
    const report: PerformanceReport = {
      bundleSize: await this.analyzeBundleSize(),
      heavyComponents: await this.findHeavyComponents(),
      optimizationOpportunities: [],
      performanceScore: 0,
    };
    
    report.performanceScore = this.calculatePerformanceScore(report);
    report.optimizationOpportunities = this.findOptimizationOpportunities(report);
    
    if (options.output) {
      this.exportReport(report, options.output, options.format || 'json');
    }
    
    return report;
  }
  
  async analyzeAccessibility(options: AnalysisOptions): Promise<AccessibilityReport> {
    const sourceFiles = this.project.getSourceFiles();
    const report: AccessibilityReport = {
      totalComponents: 0,
      accessibleComponents: 0,
      issues: [],
      recommendations: [],
      score: 0,
    };
    
    for (const sourceFile of sourceFiles) {
      await this.analyzeAccessibilityInFile(sourceFile, report);
    }
    
    report.score = (report.accessibleComponents / report.totalComponents) * 100;
    report.recommendations = this.generateA11yRecommendations(report);
    
    if (options.output) {
      this.exportReport(report, options.output, options.format || 'json');
    }
    
    return report;
  }
  
  private analyzeFile(sourceFile: any, report: UsageReport): void {
    // Analyze imports
    const imports = sourceFile.getImportDeclarations();
    
    for (const importDecl of imports) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      
      if (this.isDesignSystemImport(moduleSpecifier)) {
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
  
  private isDesignSystemImport(moduleSpecifier: string): boolean {
    return moduleSpecifier.includes('@/ui/') || 
           moduleSpecifier.includes('antd') ||
           moduleSpecifier.includes('@mui/');
  }
  
  private async analyzeBundleSize(): Promise<BundleSizeInfo> {
    // Implement bundle size analysis
    return {
      total: 0,
      components: {},
      dependencies: {},
    };
  }
  
  private async findHeavyComponents(): Promise<ComponentSizeInfo[]> {
    // Implement heavy component detection
    return [];
  }
  
  private exportReport(report: any, filename: string, format: string): void {
    let content: string;
    
    switch (format) {
      case 'json':
        content = JSON.stringify(report, null, 2);
        break;
      case 'csv':
        content = this.convertToCSV(report);
        break;
      case 'markdown':
        content = this.convertToMarkdown(report);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
    
    writeFileSync(filename, content);
    console.log(`📄 Report exported to ${filename}`);
  }
}

interface AnalysisOptions {
  output?: string;
  format?: 'json' | 'csv' | 'markdown';
}

interface UsageReport {
  totalFiles: number;
  componentUsage: Record<string, number>;
  importSources: Record<string, number>;
  unusedComponents: string[];
  migrationComplexity: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface PerformanceReport {
  bundleSize: BundleSizeInfo;
  heavyComponents: ComponentSizeInfo[];
  optimizationOpportunities: string[];
  performanceScore: number;
}

interface AccessibilityReport {
  totalComponents: number;
  accessibleComponents: number;
  issues: A11yIssue[];
  recommendations: string[];
  score: number;
}
```

---

## Performance Tools

### Bundle Analysis

```bash
# Analyze bundle size
ds-cli analyze performance --output bundle-report.json

# Find optimization opportunities
ds-cli optimize bundle

# Generate performance report
ds-cli performance report
```

### Performance Optimizer

```typescript
// tools/performance/BundleOptimizer.ts
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { writeFileSync } from 'fs';

export class BundleOptimizer {
  async analyzeBundleSize(): Promise<BundleAnalysis> {
    const analysis: BundleAnalysis = {
      totalSize: 0,
      chunks: [],
      duplicates: [],
      opportunities: [],
    };
    
    // Analyze webpack bundle
    const bundleStats = await this.getBundleStats();
    
    // Find large dependencies
    analysis.chunks = this.findLargeChunks(bundleStats);
    
    // Find duplicate dependencies
    analysis.duplicates = this.findDuplicates(bundleStats);
    
    // Generate optimization opportunities
    analysis.opportunities = this.generateOptimizations(analysis);
    
    return analysis;
  }
  
  async optimizeBundle(): Promise<OptimizationResult> {
    const analysis = await this.analyzeBundleSize();
    const optimizations: OptimizationAction[] = [];
    
    // Apply automatic optimizations
    for (const opportunity of analysis.opportunities) {
      if (opportunity.autoFixable) {
        const result = await this.applyOptimization(opportunity);
        optimizations.push(result);
      }
    }
    
    return {
      appliedOptimizations: optimizations,
      estimatedSavings: this.calculateSavings(optimizations),
      nextSteps: this.generateNextSteps(analysis),
    };
  }
  
  private generateOptimizations(analysis: BundleAnalysis): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = [];
    
    // Check for large dependencies
    analysis.chunks.forEach(chunk => {
      if (chunk.size > 500 * 1024) { // > 500KB
        opportunities.push({
          type: 'code-splitting',
          description: `Split large chunk: ${chunk.name}`,
          estimatedSavings: chunk.size * 0.3,
          autoFixable: true,
          implementation: `
// Split this chunk using dynamic imports
const ${chunk.name} = React.lazy(() => import('./${chunk.name}'));
          `,
        });
      }
    });
    
    // Check for duplicate dependencies
    analysis.duplicates.forEach(duplicate => {
      opportunities.push({
        type: 'deduplication',
        description: `Deduplicate: ${duplicate.name}`,
        estimatedSavings: duplicate.wastedSize,
        autoFixable: false,
        implementation: `
// Update package.json resolutions:
"resolutions": {
  "${duplicate.name}": "^${duplicate.preferredVersion}"
}
        `,
      });
    });
    
    return opportunities;
  }
}

interface BundleAnalysis {
  totalSize: number;
  chunks: ChunkInfo[];
  duplicates: DuplicateInfo[];
  opportunities: OptimizationOpportunity[];
}

interface OptimizationOpportunity {
  type: string;
  description: string;
  estimatedSavings: number;
  autoFixable: boolean;
  implementation: string;
}
```

---

## Testing Utilities

### Test Generation

```bash
# Generate tests for component
ds-cli generate test Button

# Generate E2E tests
ds-cli generate e2e-test "Machine Controls"

# Run accessibility tests
ds-cli test accessibility
```

### Test Generator

```typescript
// tools/generators/TestGenerator.ts
export class TestGenerator {
  async generateUnitTest(componentName: string, options: TestOptions): Promise<void> {
    const componentPath = await this.findComponentPath(componentName);
    const componentInterface = await this.analyzeComponentInterface(componentPath);
    
    const testContent = this.generateUnitTestContent(componentName, componentInterface);
    const testPath = `${componentPath.replace('.tsx', '.test.tsx')}`;
    
    await fs.writeFile(testPath, testContent);
    console.log(`✅ Unit test generated: ${testPath}`);
  }
  
  async generateE2ETest(scenarioName: string, options: TestOptions): Promise<void> {
    const testContent = this.generateE2ETestContent(scenarioName, options);
    const testPath = `e2e/${kebabCase(scenarioName)}.e2e.ts`;
    
    await fs.writeFile(testPath, testContent);
    console.log(`✅ E2E test generated: ${testPath}`);
  }
  
  private generateUnitTestContent(componentName: string, componentInterface: ComponentInterface): string {
    return `import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ${componentName} } from './${componentName}';

expect.extend(toHaveNoViolations);

describe('${componentName}', () => {
  // Basic rendering test
  it('renders correctly', () => {
    render(<${componentName}${this.getDefaultProps(componentInterface)} />);
    expect(screen.getByRole('${this.inferRole(componentName)}')).toBeInTheDocument();
  });
  
  // Accessibility test
  it('should pass accessibility tests', async () => {
    const { container } = render(<${componentName}${this.getDefaultProps(componentInterface)} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  ${this.generatePropTests(componentInterface)}
  
  ${this.generateInteractionTests(componentInterface)}
  
  ${this.generateSnapshotTest(componentName)}
});`;
  }
  
  private generateE2ETestContent(scenarioName: string, options: TestOptions): string {
    return `import { test, expect } from '@playwright/test';

test.describe('${scenarioName}', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });
  
  test('should complete ${scenarioName.toLowerCase()} workflow', async ({ page }) => {
    // Test implementation
    ${this.generateE2ESteps(scenarioName)}
  });
  
  test('should handle errors gracefully', async ({ page }) => {
    // Error handling test
  });
  
  test('should be accessible via keyboard', async ({ page }) => {
    // Keyboard navigation test
  });
});`;
  }
}
```

---

## Build Tools

### Custom Build Scripts

```typescript
// tools/build/CustomBuilder.ts
export class CustomBuilder {
  async buildDesignSystem(): Promise<void> {
    console.log('🏗️  Building Design System...');
    
    // 1. Generate design tokens
    await this.generateDesignTokens();
    
    // 2. Build components
    await this.buildComponents();
    
    // 3. Generate documentation
    await this.generateDocumentation();
    
    // 4. Create package
    await this.createPackage();
    
    console.log('✅ Design System built successfully');
  }
  
  private async generateDesignTokens(): Promise<void> {
    const tokens = await this.loadDesignTokens();
    
    // Generate CSS custom properties
    const css = this.generateCSSTokens(tokens);
    await fs.writeFile('dist/tokens.css', css);
    
    // Generate TypeScript tokens
    const ts = this.generateTSTokens(tokens);
    await fs.writeFile('dist/tokens.ts', ts);
    
    // Generate JSON tokens
    const json = JSON.stringify(tokens, null, 2);
    await fs.writeFile('dist/tokens.json', json);
  }
  
  private async buildComponents(): Promise<void> {
    // Use Vite to build components
    const vite = await import('vite');
    
    await vite.build({
      configFile: 'vite.config.lib.ts',
      build: {
        lib: {
          entry: 'src/index.ts',
          name: 'CNCDesignSystem',
          formats: ['es', 'cjs'],
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
          },
        },
      },
    });
  }
}
```

---

## VS Code Extensions

### Design System Extension

```json
// .vscode/extensions.json
{
  "recommendations": [
    "cnc-design-system.component-snippets",
    "cnc-design-system.theme-helper",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Custom Snippets

```json
// .vscode/snippets.json
{
  "CNC Component": {
    "prefix": "cnc-component",
    "body": [
      "import React from 'react';",
      "import type { Position3D, MachineStatus } from '@/types/cnc';",
      "",
      "interface ${1:Component}Props {",
      "  position?: Position3D;",
      "  status?: MachineStatus;",
      "  disabled?: boolean;",
      "  onAction?: (action: string) => void;",
      "}",
      "",
      "export const ${1:Component}: React.FC<${1:Component}Props> = ({",
      "  position,",
      "  status = 'idle',",
      "  disabled = false,",
      "  onAction,",
      "}) => {",
      "  return (",
      "    <div className=\"cnc-component\">",
      "      ${0}",
      "    </div>",
      "  );",
      "};"
    ],
    "description": "Create a new CNC component"
  }
}
```

---

## Development Scripts

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "ds:generate": "ds-cli generate",
    "ds:analyze": "ds-cli analyze usage --output analysis/usage-report.json",
    "ds:migrate": "ds-cli migrate",
    "ds:build": "ds-cli build",
    "ds:validate": "ds-cli validate tokens && ds-cli validate components"
  }
}
```

### Git Hooks

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm run test

# Validate design tokens
npm run ds:validate
```

---

**Build efficiently! 🛠️**
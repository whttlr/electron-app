# Plugin Scripting Engine

The Plugin Scripting Engine provides a secure JavaScript execution environment for plugins, enabling automation, custom logic, and workflow management.

## Features

- **Secure Execution**: Sandboxed JavaScript execution with configurable security controls
- **Script Library**: Centralized management of reusable scripts
- **Workflow Engine**: Complex multi-step automation workflows with conditions and loops
- **Parameter Validation**: Type-safe parameter validation and documentation
- **Built-in Utilities**: Math, string, array, and date utilities for common operations
- **Performance Monitoring**: Execution time and memory usage tracking
- **Error Handling**: Comprehensive error reporting and debugging support

## Core Components

### ScriptingEngine

Main engine for executing JavaScript scripts with security controls.

```typescript
import { ScriptingEngine } from './ScriptingEngine'

const engine = new ScriptingEngine({
  maxExecutionTime: 30000,
  maxMemory: 64 * 1024 * 1024,
  sandboxing: true,
  allowedModules: ['lodash', 'moment']
})

await engine.initialize()

// Execute script
const result = await engine.executeScript('math-calculator', context, {
  expression: '2 + 2 * 3'
})
```

### ScriptValidator

Validates scripts for security, syntax, and structure issues.

```typescript
import { ScriptValidator } from './ScriptValidator'

const validator = new ScriptValidator()
const result = await validator.validateScript(scriptDefinition)

if (!result.valid) {
  console.error('Validation errors:', result.errors)
}
```

### ScriptWorkflow

Manages complex multi-step workflows with conditional logic.

```typescript
import { ScriptWorkflow } from './ScriptWorkflow'

const workflow = new ScriptWorkflow(scriptingEngine)

// Register workflow
await workflow.registerWorkflow({
  id: 'cnc-setup',
  name: 'CNC Machine Setup',
  steps: [
    {
      id: 'home',
      type: 'script',
      config: { scriptId: 'home-machine' },
      nextSteps: ['probe']
    },
    {
      id: 'probe',
      type: 'script',
      config: { scriptId: 'probe-workpiece' },
      nextSteps: ['ready']
    }
  ]
})

// Execute workflow
const executionId = await workflow.executeWorkflow('cnc-setup', {}, context)
```

## Script Definition

Scripts are defined with comprehensive metadata and parameters:

```typescript
const script: ScriptDefinition = {
  id: 'coordinate-transformer',
  name: 'Coordinate Transformer',
  description: 'Transform coordinates between systems',
  category: 'cnc',
  language: 'javascript',
  source: `
    const { from, to, coordinates } = parameters;
    // Transformation logic here
    return { transformed: result };
  `,
  dependencies: ['lodash'],
  parameters: [
    {
      name: 'from',
      type: 'string',
      required: true,
      description: 'Source coordinate system'
    },
    {
      name: 'coordinates',
      type: 'object',
      required: true,
      description: 'Coordinates to transform'
    }
  ],
  metadata: {
    author: 'system',
    version: '1.0.0',
    created: new Date(),
    modified: new Date(),
    tags: ['cnc', 'coordinates']
  }
}
```

## Security Features

### Sandboxing

Scripts run in isolated VM environments with:
- Limited execution time and memory
- Restricted access to Node.js APIs
- Controlled module imports
- Safe console and timer functions

### Validation

Comprehensive security scanning for:
- `eval()` and `Function` constructor usage
- File system and network access
- Prototype pollution attempts
- Infinite loops and memory bombs
- Dangerous API access

### Permission Control

Scripts inherit permissions from their parent plugin:
- API access levels (core, machine, ui, etc.)
- Resource limits (memory, CPU, network)
- File system access restrictions

## Built-in Utilities

Scripts have access to utility functions:

```javascript
// Math utilities
utils.math.round(3.14159, 2) // 3.14
utils.math.clamp(15, 0, 10)  // 10

// String utilities
utils.string.format('Hello {name}!', { name: 'World' })
utils.string.slugify('My Script Name') // 'my-script-name'

// Array utilities
utils.array.chunk([1,2,3,4,5], 2) // [[1,2], [3,4], [5]]
utils.array.unique([1,2,2,3])     // [1,2,3]

// Date utilities
utils.date.now()
utils.date.add(new Date(), 1, 'hours')
```

## Workflow Features

### Step Types

- **Script**: Execute a registered script
- **Condition**: Branch based on JavaScript expression
- **Loop**: Iterate over arrays with item variables
- **Parallel**: Execute multiple steps concurrently
- **Delay**: Wait for specified duration
- **Input**: Request user input (UI integration)

### Variables

Workflows maintain execution variables:
- Initial variables from workflow definition
- Step results automatically added to variables
- Loop iterators (`item`, `item_index`)
- Built-in workflow context variables

### Error Handling

- Per-step error handling with `onError` redirect
- Graceful failure in parallel steps
- Comprehensive error logging and reporting

## Integration with Plugin System

### Plugin Context

Scripts receive plugin context with:
- Plugin manifest and metadata
- API access based on plugin permissions
- Plugin-specific logger and storage
- Event system for inter-plugin communication

### API Integration

Scripts can access the full plugin API hierarchy:

```javascript
// Core CNC operations
await api.core.machine.sendCommand('G28')
const status = await api.core.machine.getStatus()

// Machine control
await api.machine.gcode.execute(gcode)
await api.machine.control.jog('X', 10)

// UI integration
api.ui.dashboard.addWidget({
  type: 'status',
  position: { x: 0, y: 0 }
})
```

## Performance Monitoring

The engine tracks:
- Execution time per script
- Memory usage during execution
- Success/failure rates
- Most frequently used scripts
- Performance bottlenecks

## Configuration

Configure engine behavior via `config.js`:

```javascript
module.exports = {
  execution: {
    maxExecutionTime: 30000,
    maxMemory: 64 * 1024 * 1024
  },
  security: {
    sandboxing: true,
    strictMode: true,
    allowEval: false
  },
  allowedModules: ['lodash', 'moment', 'uuid'],
  monitoring: {
    enableMetrics: true,
    historyLimit: 100
  }
}
```

## Best Practices

### Script Development

1. **Keep scripts focused**: One responsibility per script
2. **Validate parameters**: Always check required parameters
3. **Handle errors gracefully**: Use try-catch blocks
4. **Document thoroughly**: Clear descriptions and parameter docs
5. **Test with validation**: Use ScriptValidator before deployment

### Security

1. **Minimize permissions**: Request only necessary API access
2. **Avoid dynamic evaluation**: No `eval()` or `Function()` constructors
3. **Validate inputs**: Check all user-provided data
4. **Limit resource usage**: Set appropriate timeouts and memory limits
5. **Review dependencies**: Only use approved modules

### Performance

1. **Optimize hot paths**: Profile frequently executed scripts
2. **Limit loop iterations**: Avoid infinite or very long loops
3. **Clean up resources**: Release references when done
4. **Monitor memory**: Watch for memory leaks in long-running scripts
5. **Cache results**: Store expensive computations when possible

## Examples

### Basic CNC Script

```javascript
// home-machine.js
const axes = parameters.axes || ['X', 'Y', 'Z'];

for (const axis of axes) {
  console.log(`Homing ${axis} axis...`);
  await api.machine.control.home([axis]);
}

const position = await api.machine.coordinates.getPosition();
console.log('Homing complete. Position:', position);

return { success: true, finalPosition: position };
```

### Coordinate Transformation Workflow

```typescript
const workflow: WorkflowDefinition = {
  id: 'coordinate-workflow',
  name: 'Coordinate Transformation Workflow',
  steps: [
    {
      id: 'get-position',
      type: 'script',
      config: { scriptId: 'get-current-position' },
      nextSteps: ['transform']
    },
    {
      id: 'transform',
      type: 'script',
      config: { 
        scriptId: 'coordinate-transformer',
        parameters: { from: 'machine', to: 'work' }
      },
      nextSteps: ['display']
    },
    {
      id: 'display',
      type: 'script',
      config: { scriptId: 'display-coordinates' },
      nextSteps: []
    }
  ]
}
```

This scripting engine provides a powerful and secure foundation for plugin automation and custom logic execution.
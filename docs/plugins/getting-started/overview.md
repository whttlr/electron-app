# Plugin System Overview

Welcome to the CNC Jog Controls Plugin System! This powerful extensibility framework allows developers to create custom functionality that seamlessly integrates with the core CNC control application.

## What Are Plugins?

Plugins are self-contained modules that extend the functionality of CNC Jog Controls. They can:

- **Add custom UI components** - Create new control panels, visualizations, and interface elements
- **Implement machine control logic** - Add custom G-code commands, motion control, and automation
- **Process data** - Transform G-code files, integrate with CAM software, or analyze machining data
- **Automate workflows** - Create scripts for repetitive tasks, job scheduling, and error handling
- **Integrate external systems** - Connect with cloud services, databases, or third-party applications

## Architecture Overview

The plugin system is built on a modular architecture that ensures security, performance, and maintainability:

```
┌─────────────────────────────────────────────────────────────┐
│                    CNC Jog Controls Core                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐   │
│  │   Plugin API    │  │  Security Layer │  │   UI Layer  │   │
│  │   Gateway       │  │   & Sandbox     │  │  Framework  │   │
│  └─────────────────┘  └─────────────────┘  └─────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐   │
│  │  Machine Control│  │  Data Processing│  │   Storage   │   │
│  │     Services    │  │    Services     │  │  Services   │   │
│  └─────────────────┘  └─────────────────┘  └─────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                       Plugin Runtime                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │   Plugin A  │ │   Plugin B  │ │   Plugin C  │ │   ...   │ │
│  │ (UI Widget) │ │ (G-code     │ │ (Automation)│ │         │ │
│  │             │ │ Processor)  │ │             │ │         │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Plugin API Gateway
The API Gateway provides a controlled interface between plugins and the core application:

- **Controlled Access** - Plugins can only access approved APIs
- **Permission System** - Fine-grained permissions control what plugins can do
- **Version Management** - API versioning ensures compatibility
- **Rate Limiting** - Prevents plugins from overwhelming the system

### 2. Security Layer & Sandbox
Security is paramount when allowing third-party code to run:

- **Sandboxed Execution** - Plugins run in isolated environments
- **Permission Validation** - All API calls are validated against plugin permissions
- **Resource Limits** - CPU, memory, and network usage are monitored and limited
- **Code Signing** - Plugins can be digitally signed for authenticity

### 3. Plugin Runtime
The runtime manages plugin lifecycle and execution:

- **Dynamic Loading** - Plugins are loaded and unloaded at runtime
- **Dependency Management** - Handles plugin dependencies and conflicts
- **Error Isolation** - Plugin errors don't crash the main application
- **Hot Reloading** - Development-time hot reloading for faster iteration

## Plugin Types

### 1. UI Plugins 🎨
Extend the user interface with custom components:

```typescript
// Example: Custom jog control panel
export class CustomJogPanel extends UIPlugin {
  render() {
    return (
      <Panel title="Advanced Jog Controls">
        <JogWheel size="large" precision="0.001" />
        <QuickPositions presets={this.config.positions} />
      </Panel>
    )
  }
}
```

**Common Use Cases:**
- Custom control panels
- Advanced visualization widgets
- Theme modifications
- Accessibility enhancements

### 2. Machine Control Plugins 🤖
Add custom machine control functionality:

```typescript
// Example: Tool change automation
export class AutoToolChanger extends MachinePlugin {
  async changeTool(toolNumber: number) {
    await this.machine.pause()
    await this.machine.moveToPosition({ z: this.config.safeHeight })
    await this.executeCustomGCode(`M6 T${toolNumber}`)
    await this.machine.resume()
  }
}
```

**Common Use Cases:**
- Custom G-code commands
- Advanced motion algorithms
- Tool management systems
- Safety monitoring

### 3. Data Processing Plugins 📊
Process and transform data:

```typescript
// Example: G-code optimizer
export class GCodeOptimizer extends DataPlugin {
  async optimizeFile(gcode: string): Promise<string> {
    const parser = new GCodeParser(gcode)
    const optimizer = new PathOptimizer()
    
    return optimizer.optimize(parser.commands)
  }
}
```

**Common Use Cases:**
- G-code preprocessing
- File format converters
- Quality analysis
- Performance optimization

### 4. Automation Plugins ⚡
Automate workflows and repetitive tasks:

```typescript
// Example: Job scheduler
export class JobScheduler extends AutomationPlugin {
  async scheduleJob(job: Job, schedule: Schedule) {
    await this.scheduler.add(job, {
      startTime: schedule.startTime,
      repeat: schedule.repeat,
      onComplete: this.notifyUser
    })
  }
}
```

**Common Use Cases:**
- Batch job processing
- Scheduled maintenance
- Error recovery automation
- Performance monitoring

### 5. Integration Plugins 🔗
Connect with external systems:

```typescript
// Example: CAD integration
export class FusionCAMIntegration extends IntegrationPlugin {
  async importFromFusion(projectId: string) {
    const client = new FusionAPIClient(this.config.apiKey)
    const toolpaths = await client.getToolpaths(projectId)
    
    return this.convertToGCode(toolpaths)
  }
}
```

**Common Use Cases:**
- CAD/CAM software integration
- Cloud storage synchronization
- Database connectivity
- Third-party API integration

## Permission System

Plugins must declare their required permissions in the manifest:

```json
{
  "permissions": [
    "machine:read",      // Read machine status
    "machine:write",     // Send commands to machine
    "machine:control",   // Full machine control
    "file:read",         // Read files from disk
    "file:write",        // Write files to disk
    "ui:render",         // Render UI components
    "ui:modify",         // Modify existing UI
    "network:access",    // Make network requests
    "storage:read",      // Read plugin data
    "storage:write"      // Write plugin data
  ]
}
```

### Permission Levels

1. **Read-Only** - Can observe but not modify
2. **Write** - Can modify data and settings
3. **Control** - Can control machine operation
4. **Admin** - Full system access (requires user approval)

## Plugin Lifecycle

### 1. Installation
```typescript
// User installs plugin via UI or CLI
await pluginManager.install('my-awesome-plugin')
```

### 2. Loading
```typescript
// Plugin is loaded and validated
const plugin = await pluginLoader.load('my-awesome-plugin')
await securityManager.validatePermissions(plugin)
```

### 3. Activation
```typescript
// Plugin is activated and initialized
export default class MyPlugin extends Plugin {
  async onActivate(context: PluginContext) {
    // Plugin initialization code
    await this.setupEventListeners()
    await this.registerUIComponents()
  }
}
```

### 4. Runtime
```typescript
// Plugin runs and interacts with the system
plugin.onMachineStatusChange(status => {
  // Handle machine status updates
})
```

### 5. Deactivation
```typescript
// Plugin is gracefully shut down
async onDeactivate() {
  await this.cleanupResources()
  await this.saveState()
}
```

### 6. Uninstallation
```typescript
// Plugin is removed from the system
await pluginManager.uninstall('my-awesome-plugin')
```

## API Access Patterns

### Event-Driven Architecture
Most plugin interactions use events for loose coupling:

```typescript
// Subscribe to machine events
context.machine.on('statusChange', (status) => {
  console.log('Machine status:', status)
})

// Subscribe to UI events
context.ui.on('buttonClick', (button) => {
  console.log('Button clicked:', button.id)
})

// Emit custom events
context.events.emit('customEvent', { data: 'value' })
```

### Service-Based APIs
Access core services through dependency injection:

```typescript
export default class MyPlugin extends Plugin {
  constructor(
    private machine: MachineService,
    private storage: StorageService,
    private ui: UIService
  ) {
    super()
  }
  
  async doSomething() {
    const status = await this.machine.getStatus()
    await this.storage.set('lastStatus', status)
    this.ui.showNotification('Status updated!')
  }
}
```

## Development Environment

### Hot Reloading
During development, plugins support hot reloading:

```bash
# Start development server with hot reload
cnc-plugin dev --watch
```

Changes to plugin code are automatically reflected without restarting the application.

### Debugging
Comprehensive debugging tools are available:

```typescript
// Debug logging
context.debug.log('Plugin initialized', { config: this.config })

// Performance monitoring
const timer = context.debug.startTimer('operation')
await performOperation()
timer.end()

// Memory monitoring
context.debug.trackMemory('myPlugin')
```

### Testing
Built-in testing framework for plugin validation:

```typescript
// Unit tests
describe('MyPlugin', () => {
  test('should process data correctly', async () => {
    const plugin = new MyPlugin(mockContext)
    const result = await plugin.processData(testData)
    expect(result).toMatchSnapshot()
  })
})

// Integration tests
test('plugin integration', async () => {
  const app = createTestApp()
  await app.loadPlugin(MyPlugin)
  
  const result = await app.executeCommand('my-command')
  expect(result.success).toBe(true)
})
```

## Security Considerations

### Code Review
All marketplace plugins undergo security review:

- **Static Analysis** - Automated code scanning
- **Manual Review** - Expert security evaluation
- **Vulnerability Testing** - Security penetration testing
- **Ongoing Monitoring** - Continuous security monitoring

### Sandboxing
Plugins run in secure sandboxes:

- **File System Isolation** - Limited file system access
- **Network Restrictions** - Controlled network access
- **Memory Limits** - Prevent memory exhaustion
- **CPU Throttling** - Prevent CPU monopolization

### Best Practices
Follow security best practices:

- **Principle of Least Privilege** - Request minimal permissions
- **Input Validation** - Validate all user inputs
- **Secure Communication** - Use HTTPS for network requests
- **Data Encryption** - Encrypt sensitive data

## Performance Considerations

### Resource Management
- **Memory Usage** - Monitor and limit memory consumption
- **CPU Usage** - Implement efficient algorithms
- **Network Calls** - Minimize and batch network requests
- **File I/O** - Use asynchronous file operations

### Optimization Techniques
- **Lazy Loading** - Load resources only when needed
- **Caching** - Cache frequently accessed data
- **Debouncing** - Reduce frequent operations
- **Worker Threads** - Use workers for heavy computation

## Next Steps

Now that you understand the plugin system architecture:

1. **[Create Your First Plugin](./first-plugin.md)** - Follow our step-by-step tutorial
2. **[Set Up Development Environment](./development-setup.md)** - Configure your development tools
3. **[Explore Plugin Examples](../examples/)** - See real plugin implementations
4. **[Read API Documentation](../api-reference/)** - Dive deep into available APIs

Ready to start building? Let's create your first plugin! 🚀
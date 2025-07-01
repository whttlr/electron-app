# Core API Reference

The Core API provides the fundamental interfaces and services that form the backbone of the CNC Jog Controls plugin system. This API gives plugins access to the core application functionality, machine control, data management, and system services.

## Plugin Context

The `PluginContext` is the main entry point for all plugin interactions with the core system. It's injected into your plugin during activation and provides access to all available services.

### Interface Definition

```typescript
interface PluginContext {
  // Core services
  machine: MachineService
  files: FileService
  ui: UIService
  storage: StorageService
  events: EventService
  config: ConfigService
  logger: LoggerService
  
  // Plugin management
  plugin: PluginService
  
  // Utility services
  utils: UtilsService
  validation: ValidationService
  
  // System information
  system: SystemService
  
  // Security context
  security: SecurityContext
}
```

### Usage Example

```typescript
export default class MyPlugin extends Plugin {
  async onActivate(context: PluginContext): Promise<void> {
    // Access machine service
    const machineStatus = await context.machine.getStatus()
    
    // Register UI components
    context.ui.registerPanel({
      id: 'my-panel',
      component: MyPanelComponent
    })
    
    // Listen to events
    context.events.on('machineStatusChange', this.handleStatusChange)
    
    // Store plugin data
    await context.storage.set('myData', { initialized: true })
  }
}
```

## Machine Service

The Machine Service provides complete access to CNC machine control, monitoring, and status information.

### Interface Definition

```typescript
interface MachineService extends EventEmitter {
  // Connection management
  connect(port: string, options?: ConnectionOptions): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean
  getConnectionInfo(): ConnectionInfo
  
  // Status and monitoring
  getStatus(): Promise<MachineStatus>
  getPosition(): Promise<Position>
  getState(): Promise<MachineState>
  
  // Control commands
  sendCommand(command: string): Promise<CommandResponse>
  sendGCode(gcode: string): Promise<CommandResponse>
  jog(axis: Axis, distance: number, feedRate?: number): Promise<void>
  home(axes?: Axis[]): Promise<void>
  stop(): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  reset(): Promise<void>
  
  // Safety and limits
  enableLimits(): Promise<void>
  disableLimits(): Promise<void>
  setOverride(type: OverrideType, percentage: number): Promise<void>
  
  // Coordinate systems
  setWorkCoordinates(position: Position): Promise<void>
  getWorkCoordinates(): Promise<Position>
  setMachineCoordinates(position: Position): Promise<void>
  getMachineCoordinates(): Promise<Position>
  
  // Tool management
  changeTool(toolNumber: number): Promise<void>
  setToolOffset(offset: ToolOffset): Promise<void>
  getToolOffset(toolNumber: number): Promise<ToolOffset>
  
  // Event listeners
  on(event: MachineEvent, listener: Function): void
  off(event: MachineEvent, listener: Function): void
  
  // Stream management
  startStream(gcode: string[]): Promise<void>
  pauseStream(): Promise<void>
  resumeStream(): Promise<void>
  stopStream(): Promise<void>
  getStreamStatus(): StreamStatus
}
```

### Types and Interfaces

```typescript
interface ConnectionOptions {
  baudRate?: number
  dataBits?: number
  stopBits?: number
  parity?: 'none' | 'even' | 'odd'
  flowControl?: boolean
  timeout?: number
}

interface ConnectionInfo {
  port: string
  baudRate: number
  isConnected: boolean
  connectedAt: Date
  lastActivity: Date
}

interface MachineStatus {
  state: MachineState
  position: Position
  workPosition: Position
  feedRate: number
  spindleSpeed: number
  isHoming: boolean
  isMoving: boolean
  isAlarmed: boolean
  alarmCode?: string
  activeGCode: string
  plannedBufferSize: number
  rxBufferSize: number
}

interface Position {
  x: number
  y: number
  z: number
  a?: number
  b?: number
  c?: number
  units: 'mm' | 'inch'
}

enum MachineState {
  IDLE = 'idle',
  RUN = 'run',
  HOLD = 'hold',
  JOG = 'jog',
  ALARM = 'alarm',
  DOOR = 'door',
  CHECK = 'check',
  HOME = 'home',
  SLEEP = 'sleep'
}

type Axis = 'x' | 'y' | 'z' | 'a' | 'b' | 'c'

enum OverrideType {
  FEED = 'feed',
  RAPID = 'rapid',
  SPINDLE = 'spindle'
}

interface ToolOffset {
  x: number
  y: number
  z: number
  diameter: number
  length: number
}

type MachineEvent = 
  | 'statusChange'
  | 'positionChange'
  | 'connectionChange'
  | 'alarmTriggered'
  | 'alarmCleared'
  | 'streamStarted'
  | 'streamPaused'
  | 'streamCompleted'
  | 'streamError'
  | 'commandSent'
  | 'commandReceived'
  | 'emergencyStop'

interface CommandResponse {
  success: boolean
  response: string
  timestamp: Date
  executionTime: number
  error?: string
}

interface StreamStatus {
  isStreaming: boolean
  isPaused: boolean
  currentLine: number
  totalLines: number
  progress: number
  estimatedTimeRemaining: number
  elapsedTime: number
}
```

### Usage Examples

#### Basic Machine Control

```typescript
async function basicMachineControl(context: PluginContext) {
  const machine = context.machine
  
  // Connect to machine
  await machine.connect('/dev/ttyUSB0', { baudRate: 115200 })
  
  // Get current status
  const status = await machine.getStatus()
  console.log('Machine state:', status.state)
  console.log('Position:', status.position)
  
  // Home the machine
  await machine.home(['x', 'y', 'z'])
  
  // Jog to position
  await machine.jog('x', 10, 1000) // Move X axis 10mm at 1000mm/min
  await machine.jog('y', 5, 500)   // Move Y axis 5mm at 500mm/min
  
  // Send custom G-code
  await machine.sendGCode('G1 X20 Y20 F1500')
  
  // Set work coordinates
  await machine.setWorkCoordinates({ x: 0, y: 0, z: 0, units: 'mm' })
}
```

#### Event Monitoring

```typescript
class MachineMonitorPlugin extends Plugin {
  async onActivate(context: PluginContext): Promise<void> {
    const machine = context.machine
    
    // Monitor status changes
    machine.on('statusChange', (status) => {
      console.log('Status changed:', status.state)
      if (status.isAlarmed) {
        this.handleAlarm(status.alarmCode)
      }
    })
    
    // Monitor position changes
    machine.on('positionChange', (position) => {
      this.updateUI(position)
    })
    
    // Monitor connection
    machine.on('connectionChange', (connected) => {
      if (connected) {
        console.log('Machine connected')
      } else {
        console.log('Machine disconnected')
        this.handleDisconnection()
      }
    })
    
    // Monitor alarms
    machine.on('alarmTriggered', (alarmCode) => {
      this.showAlarmDialog(alarmCode)
    })
  }
  
  private handleAlarm(alarmCode: string): void {
    // Handle alarm condition
  }
  
  private updateUI(position: Position): void {
    // Update UI with new position
  }
  
  private handleDisconnection(): void {
    // Handle disconnection
  }
  
  private showAlarmDialog(alarmCode: string): void {
    // Show alarm dialog to user
  }
}
```

#### G-code Streaming

```typescript
async function streamGCode(context: PluginContext, gcode: string[]) {
  const machine = context.machine
  
  // Monitor stream progress
  machine.on('streamStarted', () => {
    console.log('Stream started')
  })
  
  machine.on('streamProgress', (status: StreamStatus) => {
    console.log(`Progress: ${status.progress}% (${status.currentLine}/${status.totalLines})`)
    console.log(`Estimated time remaining: ${status.estimatedTimeRemaining}ms`)
  })
  
  machine.on('streamCompleted', () => {
    console.log('Stream completed successfully')
  })
  
  machine.on('streamError', (error) => {
    console.error('Stream error:', error)
  })
  
  // Start streaming
  await machine.startStream(gcode)
  
  // Control stream
  // await machine.pauseStream()
  // await machine.resumeStream()
  // await machine.stopStream()
}
```

## File Service

The File Service handles file operations, G-code processing, and project management.

### Interface Definition

```typescript
interface FileService extends EventEmitter {
  // File operations
  loadFile(path: string): Promise<FileData>
  saveFile(path: string, content: string): Promise<void>
  createFile(path: string, content: string): Promise<void>
  deleteFile(path: string): Promise<void>
  moveFile(oldPath: string, newPath: string): Promise<void>
  copyFile(source: string, destination: string): Promise<void>
  
  // Directory operations
  listDirectory(path: string): Promise<DirectoryEntry[]>
  createDirectory(path: string): Promise<void>
  deleteDirectory(path: string): Promise<void>
  
  // G-code specific operations
  parseGCode(content: string): Promise<GCodeProgram>
  validateGCode(content: string): Promise<ValidationResult>
  optimizeGCode(content: string, options?: OptimizationOptions): Promise<string>
  
  // Project management
  createProject(name: string, template?: string): Promise<Project>
  loadProject(path: string): Promise<Project>
  saveProject(project: Project): Promise<void>
  
  // Recent files
  getRecentFiles(): Promise<FileInfo[]>
  addToRecentFiles(filePath: string): Promise<void>
  clearRecentFiles(): Promise<void>
  
  // File watching
  watchFile(path: string, callback: FileWatchCallback): WatchHandle
  watchDirectory(path: string, callback: DirectoryWatchCallback): WatchHandle
  unwatchFile(handle: WatchHandle): void
  
  // Import/Export
  importFile(source: string, format: FileFormat): Promise<FileData>
  exportFile(data: FileData, format: FileFormat): Promise<string>
  
  // File metadata
  getFileInfo(path: string): Promise<FileInfo>
  getFileStats(path: string): Promise<FileStats>
  
  // Events
  on(event: FileEvent, listener: Function): void
  off(event: FileEvent, listener: Function): void
}
```

### Types and Interfaces

```typescript
interface FileData {
  path: string
  name: string
  content: string
  size: number
  mimeType: string
  encoding: string
  lastModified: Date
  metadata?: Record<string, any>
}

interface DirectoryEntry {
  name: string
  path: string
  type: 'file' | 'directory'
  size: number
  lastModified: Date
  isHidden: boolean
}

interface GCodeProgram {
  lines: GCodeLine[]
  metadata: GCodeMetadata
  bounds: BoundingBox
  estimatedTime: number
  toolChanges: ToolChange[]
}

interface GCodeLine {
  number: number
  command: string
  parameters: Record<string, number>
  comment?: string
  coordinates?: Position
  feedRate?: number
  spindleSpeed?: number
}

interface GCodeMetadata {
  totalLines: number
  totalDistance: number
  minPosition: Position
  maxPosition: Position
  tools: number[]
  estimatedTime: number
  material?: string
  units: 'mm' | 'inch'
}

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  statistics: ValidationStatistics
}

interface ValidationError {
  line: number
  column: number
  code: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

interface OptimizationOptions {
  removeComments?: boolean
  combineMovements?: boolean
  optimizeTravel?: boolean
  minimizeRetracts?: boolean
  tolerance?: number
}

interface Project {
  id: string
  name: string
  path: string
  files: ProjectFile[]
  settings: ProjectSettings
  createdAt: Date
  lastModified: Date
}

interface ProjectFile {
  id: string
  name: string
  path: string
  type: 'gcode' | 'drawing' | 'config' | 'documentation'
  size: number
  lastModified: Date
}

interface FileInfo {
  path: string
  name: string
  extension: string
  size: number
  mimeType: string
  lastModified: Date
  lastAccessed: Date
  isReadOnly: boolean
  isHidden: boolean
}

type FileEvent = 
  | 'fileLoaded'
  | 'fileSaved'
  | 'fileCreated'
  | 'fileDeleted'
  | 'fileMoved'
  | 'directoryChanged'
  | 'projectCreated'
  | 'projectLoaded'
  | 'projectSaved'

type FileWatchCallback = (event: FileWatchEvent) => void
type DirectoryWatchCallback = (event: DirectoryWatchEvent) => void

enum FileFormat {
  GCODE = 'gcode',
  NC = 'nc',
  TAP = 'tap',
  DXF = 'dxf',
  SVG = 'svg',
  JSON = 'json'
}
```

### Usage Examples

#### File Operations

```typescript
async function fileOperations(context: PluginContext) {
  const files = context.files
  
  // Load a G-code file
  const fileData = await files.loadFile('/path/to/program.nc')
  console.log('Loaded file:', fileData.name)
  console.log('Size:', fileData.size, 'bytes')
  
  // Parse G-code
  const program = await files.parseGCode(fileData.content)
  console.log('Total lines:', program.metadata.totalLines)
  console.log('Estimated time:', program.estimatedTime, 'seconds')
  console.log('Bounds:', program.bounds)
  
  // Validate G-code
  const validation = await files.validateGCode(fileData.content)
  if (!validation.isValid) {
    console.log('Validation errors:', validation.errors)
  }
  
  // Optimize G-code
  const optimized = await files.optimizeGCode(fileData.content, {
    removeComments: true,
    combineMovements: true,
    optimizeTravel: true
  })
  
  // Save optimized version
  await files.saveFile('/path/to/optimized.nc', optimized)
}
```

#### Project Management

```typescript
class ProjectManagerPlugin extends Plugin {
  async onActivate(context: PluginContext): Promise<void> {
    const files = context.files
    
    // Create new project
    const project = await files.createProject('My CNC Project', 'basic')
    
    // Load existing project
    const existingProject = await files.loadProject('/path/to/project.cncproj')
    
    // Add files to project
    existingProject.files.push({
      id: 'main-program',
      name: 'main.nc',
      path: '/path/to/main.nc',
      type: 'gcode',
      size: 1024,
      lastModified: new Date()
    })
    
    // Save project
    await files.saveProject(existingProject)
    
    // Listen for project events
    files.on('projectLoaded', (project) => {
      console.log('Project loaded:', project.name)
    })
  }
}
```

#### File Watching

```typescript
async function setupFileWatching(context: PluginContext) {
  const files = context.files
  
  // Watch a specific file
  const fileHandle = files.watchFile('/path/to/watched.nc', (event) => {
    console.log('File changed:', event.type, event.path)
    if (event.type === 'modified') {
      // Reload file automatically
      this.reloadFile(event.path)
    }
  })
  
  // Watch a directory
  const dirHandle = files.watchDirectory('/path/to/gcode/', (event) => {
    console.log('Directory changed:', event.type, event.path)
    if (event.type === 'created' && event.path.endsWith('.nc')) {
      // New G-code file detected
      this.processNewFile(event.path)
    }
  })
  
  // Clean up watchers when plugin deactivates
  // files.unwatchFile(fileHandle)
  // files.unwatchDirectory(dirHandle)
}
```

## Event Service

The Event Service provides a centralized event system for communication between plugins and the core application.

### Interface Definition

```typescript
interface EventService extends EventEmitter {
  // Event emission
  emit(event: string, ...args: any[]): boolean
  emitAsync(event: string, ...args: any[]): Promise<any[]>
  
  // Event subscription
  on(event: string, listener: Function): void
  once(event: string, listener: Function): void
  off(event: string, listener: Function): void
  removeAllListeners(event?: string): void
  
  // Event filtering and middleware
  addFilter(event: string, filter: EventFilter): void
  removeFilter(event: string, filter: EventFilter): void
  addMiddleware(middleware: EventMiddleware): void
  
  // Event history and debugging
  getEventHistory(event?: string): EventHistoryEntry[]
  getListeners(event: string): Function[]
  getEventNames(): string[]
  
  // Namespaced events
  createNamespace(namespace: string): NamespacedEventService
  
  // Event validation
  validateEvent(event: string, data: any): ValidationResult
  registerEventSchema(event: string, schema: JSONSchema): void
}
```

### Usage Examples

#### Basic Event Handling

```typescript
class EventDrivenPlugin extends Plugin {
  async onActivate(context: PluginContext): Promise<void> {
    const events = context.events
    
    // Listen to core application events
    events.on('application:ready', this.onApplicationReady.bind(this))
    events.on('machine:connected', this.onMachineConnected.bind(this))
    events.on('file:loaded', this.onFileLoaded.bind(this))
    
    // Listen to custom plugin events
    events.on('custom:dataProcessed', this.onDataProcessed.bind(this))
    
    // Emit custom events
    events.emit('plugin:activated', {
      pluginName: 'EventDrivenPlugin',
      version: '1.0.0',
      timestamp: new Date()
    })
  }
  
  private onApplicationReady(): void {
    console.log('Application is ready')
  }
  
  private onMachineConnected(connectionInfo: any): void {
    console.log('Machine connected:', connectionInfo)
  }
  
  private onFileLoaded(fileData: any): void {
    console.log('File loaded:', fileData.name)
    
    // Process the file and emit result
    this.processFile(fileData).then(result => {
      context.events.emit('custom:dataProcessed', result)
    })
  }
  
  private onDataProcessed(result: any): void {
    console.log('Data processed:', result)
  }
}
```

## Storage Service

The Storage Service provides persistent data storage for plugins with support for different storage backends and data types.

### Interface Definition

```typescript
interface StorageService {
  // Key-value operations
  get<T = any>(key: string): Promise<T | null>
  set<T = any>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  has(key: string): Promise<boolean>
  clear(): Promise<void>
  
  // Bulk operations
  getMultiple<T = any>(keys: string[]): Promise<Record<string, T>>
  setMultiple<T = any>(data: Record<string, T>): Promise<void>
  deleteMultiple(keys: string[]): Promise<void>
  
  // Key management
  keys(): Promise<string[]>
  size(): Promise<number>
  
  // Namespacing
  namespace(name: string): NamespacedStorage
  
  // Serialization options
  setSerializer(serializer: StorageSerializer): void
  getSerializer(): StorageSerializer
  
  // Storage backends
  useBackend(backend: StorageBackend): void
  getBackend(): StorageBackend
  
  // Data migration
  migrate(migrations: StorageMigration[]): Promise<void>
  
  // Storage events
  on(event: StorageEvent, listener: Function): void
  off(event: StorageEvent, listener: Function): void
}
```

### Usage Examples

#### Basic Storage Operations

```typescript
async function storageOperations(context: PluginContext) {
  const storage = context.storage
  
  // Store simple values
  await storage.set('userPreferences', {
    theme: 'dark',
    units: 'mm',
    precision: 3
  })
  
  // Retrieve values
  const preferences = await storage.get('userPreferences')
  console.log('User preferences:', preferences)
  
  // Store complex data
  await storage.set('machineProfile', {
    name: 'My CNC Router',
    dimensions: { x: 600, y: 400, z: 100 },
    maxFeedRate: 3000,
    tools: [
      { number: 1, diameter: 6, length: 25 },
      { number: 2, diameter: 3, length: 15 }
    ]
  })
  
  // Check if key exists
  if (await storage.has('machineProfile')) {
    const profile = await storage.get('machineProfile')
    console.log('Machine profile loaded:', profile.name)
  }
  
  // Get all keys
  const allKeys = await storage.keys()
  console.log('Stored keys:', allKeys)
}
```

## Configuration Service

The Configuration Service manages plugin and application configuration with validation, type safety, and live updates.

### Interface Definition

```typescript
interface ConfigService {
  // Configuration access
  get<T = any>(key: string): T | undefined
  set<T = any>(key: string, value: T): Promise<void>
  has(key: string): boolean
  delete(key: string): Promise<void>
  
  // Nested configuration
  getPath<T = any>(path: string): T | undefined
  setPath<T = any>(path: string, value: T): Promise<void>
  
  // Configuration sections
  getSection<T = any>(section: string): T | undefined
  setSection<T = any>(section: string, value: T): Promise<void>
  
  // Default values
  getWithDefault<T = any>(key: string, defaultValue: T): T
  setDefault<T = any>(key: string, value: T): void
  
  // Configuration validation
  validate(): ValidationResult
  validateSection(section: string): ValidationResult
  setSchema(schema: ConfigSchema): void
  
  // Configuration watching
  watch(key: string, callback: ConfigChangeCallback): WatchHandle
  watchSection(section: string, callback: ConfigChangeCallback): WatchHandle
  unwatch(handle: WatchHandle): void
  
  // Configuration persistence
  save(): Promise<void>
  load(): Promise<void>
  reset(): Promise<void>
  
  // Configuration events
  on(event: ConfigEvent, listener: Function): void
  off(event: ConfigEvent, listener: Function): void
}
```

### Usage Examples

#### Configuration Management

```typescript
class ConfigurablePlugin extends Plugin {
  async onActivate(context: PluginContext): Promise<void> {
    const config = context.config
    
    // Set default configuration
    config.setDefault('myPlugin.enabled', true)
    config.setDefault('myPlugin.updateInterval', 1000)
    config.setDefault('myPlugin.maxRetries', 3)
    
    // Get configuration values
    const enabled = config.getWithDefault('myPlugin.enabled', true)
    const interval = config.getWithDefault('myPlugin.updateInterval', 1000)
    
    // Watch for configuration changes
    config.watch('myPlugin.updateInterval', (newValue, oldValue) => {
      console.log('Update interval changed:', oldValue, '->', newValue)
      this.updateTimer(newValue)
    })
    
    // Set nested configuration
    await config.setPath('myPlugin.advanced.caching.enabled', true)
    await config.setPath('myPlugin.advanced.caching.maxSize', 100)
    
    // Get entire section
    const advanced = config.getSection('myPlugin.advanced')
    console.log('Advanced settings:', advanced)
  }
  
  private updateTimer(interval: number): void {
    // Update timer with new interval
  }
}
```

## Next Steps

This Core API reference covers the fundamental services available to plugins. To continue learning:

1. **[UI API Reference](./ui-api.md)** - Learn about user interface APIs
2. **[Machine API Reference](./machine-api.md)** - Detailed machine control documentation
3. **[Events API Reference](./events-api.md)** - Complete event system documentation
4. **[Plugin Examples](../examples/)** - See these APIs in action

The Core API provides the foundation for all plugin functionality. Master these interfaces to build powerful and well-integrated CNC plugins! 🚀
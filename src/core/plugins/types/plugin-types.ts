/**
 * Core Plugin System Type Definitions
 */

// Basic plugin types
export type PluginCategory = 'core' | 'machine' | 'ui' | 'integration' | 'automation' | 'utility'
export type PluginRuntime = 'nodejs' | 'webassembly' | 'native'
export type PluginStatus = 'inactive' | 'loading' | 'active' | 'error' | 'disabled'
export type APILevel = 'core' | 'machine' | 'ui' | 'integration' | 'automation' | 'utility'

// Plugin identification and metadata
export interface PluginMetadata {
  name: string
  version: string
  description: string
  author: AuthorInfo
  license: string
  homepage?: string
  repository?: RepositoryInfo
  keywords: string[]
  category: PluginCategory
}

export interface AuthorInfo {
  name: string
  email?: string
  url?: string
}

export interface RepositoryInfo {
  type: 'git' | 'svn' | 'hg'
  url: string
}

// Plugin technical specifications
export interface PluginTechnical {
  runtime: PluginRuntime
  entry: string
  dependencies: DependencyMap
  peerDependencies?: DependencyMap
  engines: EngineRequirements
  platforms: Platform[]
  architectures: Architecture[]
}

export interface DependencyMap {
  [packageName: string]: string // version range
}

export interface EngineRequirements {
  node?: string
  npm?: string
  electron?: string
  [engine: string]: string | undefined
}

export type Platform = 'win32' | 'darwin' | 'linux' | 'freebsd' | 'openbsd' | 'sunos'
export type Architecture = 'x64' | 'arm64' | 'x86' | 'arm'

// Plugin capabilities and permissions
export interface PluginCapabilities {
  apiLevel: APILevel
  permissions: Permission[]
  resources: ResourceRequirements
  features: Feature[]
  hooks: Hook[]
  exports: Export[]
}

export interface Permission {
  type: PermissionType
  scope: string
  level: 'read' | 'write' | 'execute' | 'admin'
  description: string
}

export type PermissionType = 
  | 'file_system' 
  | 'network' 
  | 'hardware' 
  | 'system' 
  | 'machine' 
  | 'ui' 
  | 'data'

export interface ResourceRequirements {
  memory?: number // MB
  cpu?: number // percentage
  disk?: number // MB
  network?: boolean
}

export interface Feature {
  name: string
  type: FeatureType
  description: string
  configuration?: any
}

export type FeatureType = 
  | 'ui_component' 
  | 'machine_driver' 
  | 'protocol_handler' 
  | 'data_processor' 
  | 'automation_task'

export interface Hook {
  name: string
  type: HookType
  phase: HookPhase
  priority: number
  handler: string
}

export type HookType = 
  | 'action' 
  | 'filter' 
  | 'event' 
  | 'lifecycle'

export type HookPhase = 
  | 'before' 
  | 'after' 
  | 'during' 
  | 'async'

export interface Export {
  name: string
  type: ExportType
  path: string
  description: string
}

export type ExportType = 
  | 'function' 
  | 'class' 
  | 'component' 
  | 'service' 
  | 'constant'

// Plugin integration points
export interface PluginIntegration {
  ui?: UIIntegration
  machine?: MachineIntegration
  automation?: AutomationIntegration
}

export interface UIIntegration {
  components?: UIComponent[]
  pages?: Page[]
  widgets?: Widget[]
  themes?: Theme[]
}

export interface UIComponent {
  name: string
  type: ComponentType
  path: string
  props?: ComponentProps
}

export type ComponentType = 
  | 'dashboard_widget' 
  | 'control_panel' 
  | 'modal' 
  | 'sidebar' 
  | 'toolbar'

export interface ComponentProps {
  [key: string]: any
}

export interface Page {
  name: string
  route: string
  component: string
  icon?: string
  menu?: boolean
}

export interface Widget {
  name: string
  component: string
  defaultSize: WidgetSize
  resizable: boolean
  configurable: boolean
}

export interface WidgetSize {
  width: number
  height: number
}

export interface Theme {
  name: string
  styles: string
  variables: ThemeVariables
}

export interface ThemeVariables {
  [variable: string]: string
}

export interface MachineIntegration {
  drivers?: DriverInfo[]
  postprocessors?: PostProcessorInfo[]
  tools?: ToolInfo[]
  protocols?: ProtocolInfo[]
}

export interface DriverInfo {
  name: string
  type: string
  supports: string[]
  configuration: any
}

export interface PostProcessorInfo {
  name: string
  machines: string[]
  formats: string[]
  configuration: any
}

export interface ToolInfo {
  name: string
  type: string
  parameters: ToolParameter[]
}

export interface ToolParameter {
  name: string
  type: 'number' | 'string' | 'boolean'
  required: boolean
  default?: any
}

export interface ProtocolInfo {
  name: string
  version: string
  transport: 'serial' | 'ethernet' | 'usb' | 'wireless'
  commands: ProtocolCommand[]
}

export interface ProtocolCommand {
  name: string
  format: string
  response?: string
  description: string
}

export interface AutomationIntegration {
  workflows?: WorkflowInfo[]
  triggers?: TriggerInfo[]
  actions?: ActionInfo[]
  schedulers?: SchedulerInfo[]
}

export interface WorkflowInfo {
  name: string
  description: string
  steps: WorkflowStep[]
  triggers: string[]
}

export interface WorkflowStep {
  name: string
  type: 'action' | 'condition' | 'loop' | 'parallel'
  configuration: any
}

export interface TriggerInfo {
  name: string
  type: TriggerType
  conditions: TriggerCondition[]
  actions: string[]
}

export type TriggerType = 
  | 'event' 
  | 'time' 
  | 'condition' 
  | 'manual'

export interface TriggerCondition {
  property: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains'
  value: any
}

export interface ActionInfo {
  name: string
  type: ActionType
  parameters: ActionParameter[]
  async: boolean
}

export type ActionType = 
  | 'machine' 
  | 'data' 
  | 'notification' 
  | 'integration' 
  | 'ui'

export interface ActionParameter {
  name: string
  type: string
  required: boolean
  description: string
}

export interface SchedulerInfo {
  name: string
  type: 'cron' | 'interval' | 'timeout'
  expression: string
  timezone?: string
}

// Plugin configuration
export interface PluginConfiguration {
  schema: JSONSchema
  defaults: DefaultConfig
  validation: ValidationRules
  ui: ConfigurationUI
}

export interface JSONSchema {
  type: string
  properties: { [key: string]: any }
  required?: string[]
  additionalProperties?: boolean
}

export interface DefaultConfig {
  [key: string]: any
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

export interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required?: boolean
  min?: number
  max?: number
  pattern?: string
  enum?: any[]
  custom?: string // function name
}

export interface ConfigurationUI {
  type: 'form' | 'wizard' | 'advanced'
  layout: UILayout[]
  groups?: ConfigGroup[]
}

export interface UILayout {
  field: string
  type: 'input' | 'select' | 'checkbox' | 'slider' | 'textarea'
  label: string
  description?: string
  options?: UIOption[]
}

export interface UIOption {
  label: string
  value: any
}

export interface ConfigGroup {
  name: string
  label: string
  fields: string[]
  collapsible?: boolean
}

// Plugin lifecycle and state
export interface PluginLifecycle {
  status: PluginStatus
  loadedAt?: Date
  lastError?: PluginError
  dependencies: PluginDependency[]
  dependents: string[]
  configuration: any
  metrics: PluginMetrics
}

export interface PluginError {
  code: string
  message: string
  stack?: string
  timestamp: Date
  context?: any
}

export interface PluginDependency {
  name: string
  version: string
  resolved: boolean
  optional: boolean
}

export interface PluginMetrics {
  memoryUsage: number
  cpuUsage: number
  eventsSent: number
  eventsReceived: number
  apiCalls: number
  errors: number
  lastActivity: Date
}

// Complete plugin manifest
export interface PluginManifest {
  metadata: PluginMetadata
  technical: PluginTechnical
  capabilities: PluginCapabilities
  integration: PluginIntegration
  configuration: PluginConfiguration
}

// Plugin registry and discovery
export interface PluginRegistryEntry {
  manifest: PluginManifest
  lifecycle: PluginLifecycle
  path: string
  source: PluginSource
  verified: boolean
  signature?: string
}

export interface PluginSource {
  type: 'local' | 'marketplace' | 'repository' | 'url'
  location: string
  checksum?: string
}

// Plugin validation and security
export interface PluginValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  security: SecurityAssessment
}

export interface ValidationError {
  code: string
  message: string
  severity: 'error' | 'warning' | 'info'
  path?: string
}

export interface ValidationWarning {
  code: string
  message: string
  suggestion?: string
}

export interface SecurityAssessment {
  trustLevel: 'high' | 'medium' | 'low' | 'unknown'
  risks: SecurityRisk[]
  permissions: PermissionAssessment[]
  signature: SignatureValidation
}

export interface SecurityRisk {
  type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  mitigation?: string
}

export interface PermissionAssessment {
  permission: Permission
  justified: boolean
  risk: 'high' | 'medium' | 'low'
  reason?: string
}

export interface SignatureValidation {
  signed: boolean
  valid: boolean
  issuer?: string
  timestamp?: Date
  algorithm?: string
}

// Plugin events
export interface PluginEvent {
  type: PluginEventType
  plugin: string
  timestamp: Date
  data?: any
}

export type PluginEventType = 
  | 'loaded' 
  | 'unloaded' 
  | 'activated' 
  | 'deactivated' 
  | 'error' 
  | 'updated' 
  | 'configured'

// Plugin context and runtime
export interface PluginContext {
  plugin: PluginManifest
  api: PluginAPI
  logger: PluginLogger
  storage: PluginStorage
  events: PluginEventEmitter
  configuration: any
}

export interface PluginAPI {
  [namespace: string]: any
}

export interface PluginLogger {
  debug: (message: string, data?: any) => void
  info: (message: string, data?: any) => void
  warn: (message: string, data?: any) => void
  error: (message: string, data?: any) => void
}

export interface PluginStorage {
  get: (key: string) => Promise<any>
  set: (key: string, value: any) => Promise<void>
  delete: (key: string) => Promise<void>
  clear: () => Promise<void>
  keys: () => Promise<string[]>
}

export interface PluginEventEmitter {
  emit: (event: string, data?: any) => void
  on: (event: string, handler: Function) => () => void
  off: (event: string, handler: Function) => void
}
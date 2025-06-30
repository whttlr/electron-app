/**
 * Plugin API System Type Definitions
 */

import { Position } from '../../coordinates'
import { MachineStatus, ConnectionConfig } from '../../machine'

// API level definitions
export interface PluginAPILevels {
  core: CoreAPI
  machine: MachineAPI
  ui: UIApi
  integration: IntegrationAPI
  automation: AutomationAPI
  utility: UtilityAPI
}

// Core API level
export interface CoreAPI {
  machine: CoreMachineAPI
  safety: CoreSafetyAPI
  data: CoreDataAPI
  events: CoreEventsAPI
}

export interface CoreMachineAPI {
  connect: (config: ConnectionConfig) => Promise<Connection>
  disconnect: () => Promise<void>
  sendCommand: (command: string) => Promise<Response>
  getStatus: () => Promise<MachineStatus>
  subscribe: (event: string, callback: Function) => Subscription
  emergencyStop: () => Promise<void>
}

export interface Connection {
  id: string
  status: 'connected' | 'disconnected' | 'error'
  config: ConnectionConfig
  lastActivity: Date
}

export interface Response {
  success: boolean
  data?: any
  error?: string
  timestamp: Date
}

export interface Subscription {
  id: string
  event: string
  unsubscribe: () => void
}

export interface CoreSafetyAPI {
  emergencyStop: () => Promise<void>
  validateCommand: (command: string) => ValidationResult
  checkBoundaries: (position: Position) => BoundaryResult
  setSafetyLimits: (limits: SafetyLimits) => Promise<void>
  getSafetyStatus: () => Promise<SafetyStatus>
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface BoundaryResult {
  withinBounds: boolean
  violations: BoundaryViolation[]
}

export interface BoundaryViolation {
  axis: 'x' | 'y' | 'z'
  value: number
  limit: number
  type: 'min' | 'max'
}

export interface SafetyLimits {
  position: {
    min: Position
    max: Position
  }
  speed: {
    max: number
    rapid: number
  }
  acceleration: {
    max: number
  }
}

export interface SafetyStatus {
  emergencyStop: boolean
  safetyLimitsActive: boolean
  boundaryCheckEnabled: boolean
  lastSafetyEvent?: SafetyEvent
}

export interface SafetyEvent {
  type: 'emergency_stop' | 'boundary_violation' | 'speed_limit' | 'safety_limit'
  timestamp: Date
  details: any
}

export interface CoreDataAPI {
  log: (level: LogLevel, message: string, data?: any) => void
  store: (key: string, value: any) => Promise<void>
  retrieve: (key: string) => Promise<any>
  subscribe: (pattern: string, callback: Function) => Subscription
  query: (query: DataQuery) => Promise<QueryResult>
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface DataQuery {
  type: 'log' | 'metric' | 'event' | 'state'
  filters?: QueryFilter[]
  sort?: QuerySort[]
  limit?: number
  offset?: number
}

export interface QueryFilter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'like'
  value: any
}

export interface QuerySort {
  field: string
  direction: 'asc' | 'desc'
}

export interface QueryResult {
  data: any[]
  total: number
  hasMore: boolean
}

export interface CoreEventsAPI {
  emit: (event: string, data?: any) => void
  on: (event: string, callback: Function) => Subscription
  off: (event: string, callback: Function) => void
  once: (event: string, callback: Function) => Subscription
  removeAllListeners: (event?: string) => void
}

// Machine API level
export interface MachineAPI {
  gcode: GCodeAPI
  tools: ToolsAPI
  coordinates: CoordinatesAPI
  control: MachineControlAPI
}

export interface GCodeAPI {
  parse: (gcode: string) => ParsedGCode
  validate: (gcode: string) => ValidationResult
  optimize: (gcode: string) => OptimizedGCode
  simulate: (gcode: string) => SimulationResult
  execute: (gcode: string) => Promise<ExecutionResult>
}

export interface ParsedGCode {
  lines: GCodeLine[]
  metadata: GCodeMetadata
  errors: GCodeError[]
}

export interface GCodeLine {
  line: number
  raw: string
  commands: GCodeCommand[]
  comment?: string
}

export interface GCodeCommand {
  type: string
  parameters: { [key: string]: number | string }
}

export interface GCodeMetadata {
  totalLines: number
  estimatedTime: number
  boundingBox: BoundingBox
  toolChanges: number
}

export interface BoundingBox {
  min: Position
  max: Position
}

export interface GCodeError {
  line: number
  message: string
  severity: 'error' | 'warning'
}

export interface OptimizedGCode {
  original: string
  optimized: string
  improvements: Optimization[]
  timeSaved: number
}

export interface Optimization {
  type: string
  description: string
  lineNumbers: number[]
  benefit: string
}

export interface SimulationResult {
  path: SimulationPath[]
  time: number
  distance: number
  toolpaths: Toolpath[]
}

export interface SimulationPath {
  start: Position
  end: Position
  type: 'rapid' | 'feed' | 'arc'
  feedrate?: number
}

export interface Toolpath {
  tool: number
  segments: PathSegment[]
}

export interface PathSegment {
  start: Position
  end: Position
  type: 'linear' | 'arc'
  feedrate: number
}

export interface ExecutionResult {
  success: boolean
  linesExecuted: number
  executionTime: number
  finalPosition: Position
  errors: ExecutionError[]
}

export interface ExecutionError {
  line: number
  command: string
  error: string
  timestamp: Date
}

export interface ToolsAPI {
  getLibrary: () => Promise<ToolLibrary>
  addTool: (tool: Tool) => Promise<void>
  updateTool: (id: string, tool: Partial<Tool>) => Promise<void>
  deleteTool: (id: string) => Promise<void>
  measureTool: (id: string) => Promise<ToolMeasurement>
  setActiveTool: (id: string) => Promise<void>
}

export interface ToolLibrary {
  tools: Tool[]
  categories: ToolCategory[]
  activeTool?: string
}

export interface Tool {
  id: string
  name: string
  type: ToolType
  parameters: ToolParameters
  geometry: ToolGeometry
  material: string
  manufacturer?: string
  partNumber?: string
}

export type ToolType = 'endmill' | 'drill' | 'tap' | 'boring' | 'chamfer' | 'custom'

export interface ToolParameters {
  diameter: number
  length: number
  fluteCount?: number
  cornerRadius?: number
  helixAngle?: number
  coatingType?: string
}

export interface ToolGeometry {
  type: ToolType
  dimensions: ToolDimensions
  cutting: CuttingGeometry
}

export interface ToolDimensions {
  diameter: number
  length: number
  shankDiameter: number
  overhang: number
}

export interface CuttingGeometry {
  fluteCount: number
  helixAngle: number
  cornerRadius: number
  reliefAngle: number
}

export interface ToolCategory {
  id: string
  name: string
  description: string
  tools: string[]
}

export interface ToolMeasurement {
  tool: string
  diameter: number
  length: number
  runout: number
  timestamp: Date
  method: 'manual' | 'probe' | 'laser'
}

export interface CoordinatesAPI {
  getPosition: () => Promise<Position>
  setWorkOffset: (wcs: WCS, offset: Position) => Promise<void>
  getWorkOffset: (wcs: WCS) => Promise<Position>
  transformCoordinates: (from: CoordSystem, to: CoordSystem, pos: Position) => Position
  getActiveWCS: () => Promise<WCS>
  setActiveWCS: (wcs: WCS) => Promise<void>
}

export type WCS = 'G54' | 'G55' | 'G56' | 'G57' | 'G58' | 'G59'
export type CoordSystem = 'machine' | 'work' | WCS

export interface MachineControlAPI {
  jog: (axis: 'x' | 'y' | 'z', distance: number) => Promise<void>
  home: (axes?: ('x' | 'y' | 'z')[]) => Promise<void>
  probe: (direction: ProbeDirection, distance: number) => Promise<ProbeResult>
  setFeedrate: (feedrate: number) => Promise<void>
  setSpindleSpeed: (rpm: number) => Promise<void>
  coolantOn: (type?: 'flood' | 'mist') => Promise<void>
  coolantOff: () => Promise<void>
}

export type ProbeDirection = '+x' | '-x' | '+y' | '-y' | '+z' | '-z'

export interface ProbeResult {
  success: boolean
  position: Position
  contact: boolean
  timestamp: Date
}

// UI API level
export interface UIApi {
  components: UIComponentsAPI
  dashboard: DashboardAPI
  navigation: NavigationAPI
  dialogs: DialogsAPI
}

export interface UIComponentsAPI {
  register: (name: string, component: UIComponent) => void
  unregister: (name: string) => void
  render: (name: string, props: any, container: Element) => void
  update: (name: string, props: any) => void
  destroy: (name: string) => void
  list: () => string[]
}

export interface UIComponent {
  name: string
  render: (props: any, container: Element) => void
  update?: (props: any) => void
  destroy?: () => void
  props?: ComponentPropTypes
}

export interface ComponentPropTypes {
  [propName: string]: PropType
}

export interface PropType {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function'
  required?: boolean
  default?: any
  validator?: (value: any) => boolean
}

export interface DashboardAPI {
  addWidget: (widget: DashboardWidget) => void
  removeWidget: (id: string) => void
  updateWidget: (id: string, data: any) => void
  createPanel: (panel: DashboardPanel) => void
  removePanel: (id: string) => void
  getLayout: () => DashboardLayout
  setLayout: (layout: DashboardLayout) => void
}

export interface DashboardWidget {
  id: string
  title: string
  component: string
  size: WidgetSize
  position: WidgetPosition
  config: any
  resizable: boolean
  movable: boolean
}

export interface WidgetPosition {
  x: number
  y: number
}

export interface DashboardPanel {
  id: string
  title: string
  widgets: string[]
  layout: PanelLayout
  visible: boolean
}

export interface PanelLayout {
  type: 'grid' | 'flex' | 'stack'
  columns?: number
  gap?: number
  direction?: 'row' | 'column'
}

export interface DashboardLayout {
  panels: DashboardPanel[]
  widgets: DashboardWidget[]
  settings: LayoutSettings
}

export interface LayoutSettings {
  theme: string
  compact: boolean
  animations: boolean
  autoSave: boolean
}

export interface NavigationAPI {
  addMenuItem: (item: MenuItem) => void
  removeMenuItem: (id: string) => void
  addToolbarButton: (button: ToolbarButton) => void
  removeToolbarButton: (id: string) => void
  navigate: (path: string) => void
  getCurrentPath: () => string
}

export interface MenuItem {
  id: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
  action?: () => void
  visible: boolean
  enabled: boolean
}

export interface ToolbarButton {
  id: string
  label: string
  icon: string
  action: () => void
  tooltip?: string
  enabled: boolean
  visible: boolean
}

export interface DialogsAPI {
  showModal: (modal: ModalConfig) => Promise<any>
  closeModal: (id: string) => void
  showNotification: (notification: NotificationConfig) => void
  showAlert: (alert: AlertConfig) => Promise<boolean>
  showConfirm: (confirm: ConfirmConfig) => Promise<boolean>
}

export interface ModalConfig {
  id: string
  title: string
  content: string | UIComponent
  size: 'small' | 'medium' | 'large' | 'fullscreen'
  closable: boolean
  buttons?: ModalButton[]
}

export interface ModalButton {
  label: string
  type: 'primary' | 'secondary' | 'danger'
  action: () => any
}

export interface NotificationConfig {
  id?: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: () => void
}

export interface AlertConfig {
  title: string
  message: string
  type: 'info' | 'warning' | 'error'
  button?: string
}

export interface ConfirmConfig {
  title: string
  message: string
  confirmButton?: string
  cancelButton?: string
  type?: 'warning' | 'danger'
}

// Integration API level
export interface IntegrationAPI {
  http: HTTPApi
  database: DatabaseAPI
  files: FilesAPI
  messaging: MessagingAPI
}

export interface HTTPApi {
  request: (config: RequestConfig) => Promise<HTTPResponse>
  get: (url: string, config?: RequestConfig) => Promise<HTTPResponse>
  post: (url: string, data?: any, config?: RequestConfig) => Promise<HTTPResponse>
  put: (url: string, data?: any, config?: RequestConfig) => Promise<HTTPResponse>
  delete: (url: string, config?: RequestConfig) => Promise<HTTPResponse>
  webhook: (endpoint: string, handler: WebhookHandler) => WebhookRegistration
}

export interface RequestConfig {
  headers?: { [key: string]: string }
  timeout?: number
  auth?: AuthConfig
  params?: { [key: string]: any }
}

export interface AuthConfig {
  type: 'basic' | 'bearer' | 'api_key'
  credentials: any
}

export interface HTTPResponse {
  status: number
  statusText: string
  headers: { [key: string]: string }
  data: any
}

export interface WebhookHandler {
  (request: WebhookRequest): WebhookResponse | Promise<WebhookResponse>
}

export interface WebhookRequest {
  method: string
  path: string
  headers: { [key: string]: string }
  body: any
  query: { [key: string]: string }
}

export interface WebhookResponse {
  status: number
  headers?: { [key: string]: string }
  body?: any
}

export interface WebhookRegistration {
  id: string
  endpoint: string
  unregister: () => void
}

export interface DatabaseAPI {
  query: (sql: string, params?: any[]) => Promise<DatabaseQueryResult>
  transaction: (operations: DatabaseOperation[]) => Promise<TransactionResult>
  subscribe: (table: string, callback: Function) => Subscription
  backup: () => Promise<BackupResult>
  restore: (backup: string) => Promise<RestoreResult>
}

export interface DatabaseQueryResult {
  rows: any[]
  fields: DatabaseField[]
  rowCount: number
  command: string
}

export interface DatabaseField {
  name: string
  type: string
  nullable: boolean
}

export interface DatabaseOperation {
  type: 'insert' | 'update' | 'delete' | 'select'
  sql: string
  params?: any[]
}

export interface TransactionResult {
  success: boolean
  results: DatabaseQueryResult[]
  error?: string
}

export interface BackupResult {
  success: boolean
  filename: string
  size: number
  timestamp: Date
}

export interface RestoreResult {
  success: boolean
  restoredTables: string[]
  timestamp: Date
}

export interface FilesAPI {
  read: (path: string) => Promise<string | Buffer>
  write: (path: string, data: string | Buffer) => Promise<void>
  exists: (path: string) => Promise<boolean>
  list: (path: string) => Promise<FileInfo[]>
  watch: (path: string, callback: FileWatchCallback) => FileWatcher
  upload: (file: File) => Promise<UploadResult>
  download: (path: string) => Promise<DownloadResult>
}

export interface FileInfo {
  name: string
  path: string
  size: number
  type: 'file' | 'directory'
  modified: Date
  permissions: FilePermissions
}

export interface FilePermissions {
  read: boolean
  write: boolean
  execute: boolean
}

export interface FileWatchCallback {
  (event: FileWatchEvent): void
}

export interface FileWatchEvent {
  type: 'created' | 'modified' | 'deleted' | 'moved'
  path: string
  timestamp: Date
}

export interface FileWatcher {
  id: string
  path: string
  stop: () => void
}

export interface UploadResult {
  success: boolean
  path: string
  size: number
  checksum: string
}

export interface DownloadResult {
  success: boolean
  data: Buffer
  contentType: string
  size: number
}

export interface MessagingAPI {
  send: (channel: string, message: any) => Promise<void>
  subscribe: (channel: string, handler: MessageHandler) => MessageSubscription
  publish: (topic: string, data: any) => Promise<void>
  createQueue: (name: string, options?: QueueOptions) => Promise<MessageQueue>
}

export interface MessageHandler {
  (message: Message): void | Promise<void>
}

export interface Message {
  id: string
  channel: string
  data: any
  timestamp: Date
  sender?: string
}

export interface MessageSubscription {
  id: string
  channel: string
  unsubscribe: () => void
}

export interface QueueOptions {
  persistent?: boolean
  maxSize?: number
  priority?: boolean
}

export interface MessageQueue {
  name: string
  push: (message: any) => Promise<void>
  pop: () => Promise<any>
  peek: () => Promise<any>
  size: () => Promise<number>
  clear: () => Promise<void>
}

// Automation API level
export interface AutomationAPI {
  workflows: WorkflowAPI
  triggers: TriggerAPI
  actions: ActionAPI
  scheduler: SchedulerAPI
}

export interface WorkflowAPI {
  create: (workflow: WorkflowDefinition) => Promise<string>
  start: (id: string, input?: any) => Promise<WorkflowExecution>
  stop: (executionId: string) => Promise<void>
  pause: (executionId: string) => Promise<void>
  resume: (executionId: string) => Promise<void>
  getStatus: (executionId: string) => Promise<WorkflowStatus>
  list: () => Promise<WorkflowDefinition[]>
}

export interface WorkflowDefinition {
  id?: string
  name: string
  description: string
  version: string
  steps: WorkflowStep[]
  triggers: WorkflowTrigger[]
  variables: WorkflowVariable[]
}

export interface WorkflowStep {
  id: string
  name: string
  type: StepType
  action: string
  parameters: { [key: string]: any }
  conditions?: StepCondition[]
  retry?: RetryConfig
}

export type StepType = 'action' | 'condition' | 'loop' | 'parallel' | 'subworkflow'

export interface StepCondition {
  expression: string
  onTrue?: string // next step id
  onFalse?: string // next step id
}

export interface RetryConfig {
  maxAttempts: number
  delay: number
  backoff: 'linear' | 'exponential'
}

export interface WorkflowTrigger {
  type: WorkflowTriggerType
  configuration: any
}

export type WorkflowTriggerType = 'manual' | 'scheduled' | 'event' | 'webhook'

export interface WorkflowVariable {
  name: string
  type: string
  default?: any
  required: boolean
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: WorkflowExecutionStatus
  startedAt: Date
  completedAt?: Date
  input?: any
  output?: any
  error?: string
  steps: StepExecution[]
}

export type WorkflowExecutionStatus = 'running' | 'completed' | 'failed' | 'paused' | 'cancelled'

export interface StepExecution {
  stepId: string
  status: StepExecutionStatus
  startedAt: Date
  completedAt?: Date
  output?: any
  error?: string
  retryCount: number
}

export type StepExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

export interface WorkflowStatus {
  execution: WorkflowExecution
  progress: number
  currentStep?: string
  timeRemaining?: number
}

export interface TriggerAPI {
  register: (trigger: TriggerDefinition) => Promise<string>
  unregister: (id: string) => Promise<void>
  enable: (id: string) => Promise<void>
  disable: (id: string) => Promise<void>
  list: () => Promise<TriggerDefinition[]>
  getHistory: (id: string) => Promise<TriggerEvent[]>
}

export interface TriggerDefinition {
  id?: string
  name: string
  type: TriggerType
  conditions: TriggerCondition[]
  actions: TriggerAction[]
  enabled: boolean
  cooldown?: number
}

export interface TriggerAction {
  type: string
  parameters: { [key: string]: any }
}

export interface TriggerEvent {
  id: string
  triggerId: string
  timestamp: Date
  conditions: any
  actions: TriggerActionResult[]
}

export interface TriggerActionResult {
  action: string
  success: boolean
  result?: any
  error?: string
  duration: number
}

export interface ActionAPI {
  register: (action: ActionDefinition) => void
  unregister: (name: string) => void
  execute: (name: string, parameters: any) => Promise<ActionResult>
  list: () => ActionDefinition[]
  validate: (name: string, parameters: any) => ValidationResult
}

export interface ActionDefinition {
  name: string
  description: string
  parameters: ActionParameterDefinition[]
  execute: (parameters: any, context: ActionContext) => Promise<ActionResult>
  validate?: (parameters: any) => ValidationResult
}

export interface ActionParameterDefinition {
  name: string
  type: string
  required: boolean
  description: string
  default?: any
  validation?: any
}

export interface ActionContext {
  plugin: string
  execution: string
  variables: { [key: string]: any }
  logger: PluginLogger
}

export interface ActionResult {
  success: boolean
  data?: any
  error?: string
  metrics?: ActionMetrics
}

export interface ActionMetrics {
  duration: number
  memoryUsed: number
  resourcesAccessed: string[]
}

export interface SchedulerAPI {
  schedule: (job: ScheduledJob) => Promise<string>
  unschedule: (id: string) => Promise<void>
  pause: (id: string) => Promise<void>
  resume: (id: string) => Promise<void>
  list: () => Promise<ScheduledJob[]>
  getHistory: (id: string) => Promise<JobExecution[]>
}

export interface ScheduledJob {
  id?: string
  name: string
  schedule: ScheduleExpression
  action: string
  parameters: any
  enabled: boolean
  timezone?: string
  retries?: number
}

export interface ScheduleExpression {
  type: 'cron' | 'interval' | 'once'
  expression: string
  startDate?: Date
  endDate?: Date
}

export interface JobExecution {
  id: string
  jobId: string
  startedAt: Date
  completedAt?: Date
  status: JobExecutionStatus
  result?: any
  error?: string
}

export type JobExecutionStatus = 'running' | 'completed' | 'failed' | 'cancelled'

// Utility API level
export interface UtilityAPI {
  math: MathAPI
  string: StringAPI
  date: DateAPI
  validation: ValidationAPI
}

export interface MathAPI {
  calculate: (expression: string) => number
  round: (value: number, decimals: number) => number
  clamp: (value: number, min: number, max: number) => number
  interpolate: (start: number, end: number, factor: number) => number
  distance: (p1: Position, p2: Position) => number
}

export interface StringAPI {
  format: (template: string, values: any) => string
  sanitize: (text: string) => string
  hash: (text: string, algorithm?: string) => string
  encode: (text: string, encoding: string) => string
  decode: (text: string, encoding: string) => string
}

export interface DateAPI {
  now: () => Date
  format: (date: Date, format: string) => string
  parse: (dateString: string, format?: string) => Date
  add: (date: Date, amount: number, unit: TimeUnit) => Date
  diff: (date1: Date, date2: Date, unit: TimeUnit) => number
}

export type TimeUnit = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'

export interface ValidationAPI {
  validate: (value: any, schema: ValidationSchema) => ValidationResult
  sanitize: (value: any, rules: SanitizationRules) => any
  createSchema: (definition: SchemaDefinition) => ValidationSchema
}

export interface ValidationSchema {
  type: string
  properties?: { [key: string]: ValidationSchema }
  rules: ValidationRule[]
}

export interface SanitizationRules {
  [key: string]: SanitizationRule
}

export interface SanitizationRule {
  type: string
  options?: any
}

export interface SchemaDefinition {
  [key: string]: any
}
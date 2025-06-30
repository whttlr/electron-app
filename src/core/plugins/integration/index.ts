/**
 * Plugin Integration Framework - Public API exports
 */

// Core framework
export { IntegrationFramework } from './IntegrationFramework'
export type {
  IntegrationAdapter,
  AdapterType,
  AdapterStatus,
  ConnectionResult,
  AdapterOperation,
  AdapterResult,
  AdapterError,
  IntegrationDefinition,
  IntegrationConfig,
  IntegrationCredentials,
  DataMapping,
  DataMappingField,
  DataTransformation,
  IntegrationTrigger,
  IntegrationTriggerConfig,
  IntegrationExecution
} from './IntegrationFramework'

// Built-in adapters
export { DatabaseAdapter } from './adapters/DatabaseAdapter'
export type {
  DatabaseConfig,
  DatabaseCredentials
} from './adapters/DatabaseAdapter'

export { HttpApiAdapter } from './adapters/HttpApiAdapter'
export type {
  HttpApiConfig,
  HttpApiCredentials
} from './adapters/HttpApiAdapter'

export { FileSystemAdapter } from './adapters/FileSystemAdapter'
export type {
  FileSystemConfig
} from './adapters/FileSystemAdapter'

// Configuration
import integrationConfig from './config'
export { integrationConfig }
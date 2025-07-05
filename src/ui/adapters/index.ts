/**
 * UI Adapters Public API
 * 
 * Exports adapter components and utilities for use throughout the application
 */

// Configuration
export { defaultAdapterConfig, getAdapterConfig } from './config';
export type { AdapterConfig } from './config';

// Ant Design Adapter
export * from './ant-design';

// Custom Adapter Components
export * from './custom';

// Headless UI Adapter
export * from './headless-ui';

// Adapter utilities
export { createAdapterComponent } from './utils/adapter-factory';
export { useAdapterConfig } from './utils/adapter-hooks';
export type { AdapterComponent, AdapterProps } from './utils/adapter-types';
/**
 * UI Providers Public API
 * 
 * Exports React context providers for global UI state management
 */

// Configuration
export { defaultProviderConfig, getProviderConfig } from './config';
export type { ProviderConfig } from './config';

// Providers
export { default as ComponentProvider } from './ComponentProvider';
export { default as ThemeProvider } from './ThemeProvider';
export { default as AccessibilityProvider } from './AccessibilityProvider';
export { default as LayoutProvider } from './LayoutProvider';
export { default as PluginProvider } from './PluginProvider';

// Hooks
export { useComponent } from './hooks/useComponent';
export { useTheme } from './hooks/useTheme';
export { useAccessibility } from './hooks/useAccessibility';
export { useLayout } from './hooks/useLayout';
export { usePlugin } from './hooks/usePlugin';

// Context types
export type { ComponentContextValue } from './ComponentProvider';
export type { ThemeContextValue } from './ThemeProvider';
export type { AccessibilityContextValue } from './AccessibilityProvider';
export type { LayoutContextValue } from './LayoutProvider';
export type { PluginContextValue } from './PluginProvider';

// Utilities
export { createProvider } from './utils/provider-factory';
export { combineProviders } from './utils/provider-combiner';
export { withProvider } from './utils/provider-hoc';
// UI Shared Module - Public API
// App-specific shared components and utilities

// Utilities
export * from './utils';

// App-specific components
export * from './Sidebar';
export * from './ThemeProvider';
export * from './ConnectionModal';

// Error boundary system
export * from './errorBoundary';

// Re-export app-specific types
export type { SidebarProps } from './Sidebar';
export type { CustomThemeProviderProps, ThemeToggleProps } from './ThemeProvider';

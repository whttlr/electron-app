/**
 * Navigation UI Configuration
 * 
 * Configuration settings for navigation components and behavior.
 */

export const navigationUIConfig = {
  // Main navigation settings
  sidebar: {
    defaultCollapsed: false,
    collapsedWidth: 80,
    width: 240,
    breakpoint: 'lg',
    theme: 'light'
  },

  // Breadcrumb settings
  breadcrumbs: {
    enabled: true,
    showHome: true,
    separator: '/',
    maxItems: 5
  },

  // Route view settings
  routeView: {
    enableLazyLoading: true,
    enableErrorBoundary: true,
    loadingTimeout: 5000,
    retryAttempts: 3
  },

  // Animation settings
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out'
  },

  // Responsive breakpoints
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  },

  // Accessibility settings
  accessibility: {
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    focusOutlineWidth: 2
  }
};
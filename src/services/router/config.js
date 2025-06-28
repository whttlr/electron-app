/**
 * Router Configuration
 * 
 * Centralized configuration for all application routes and router settings.
 * Follows the modular architecture pattern with externalized configuration.
 */

export const routerConfig = {
  defaultRoute: '/',
  baseUrl: '',
  enableBreadcrumbs: true,
  enableDeepLinking: true,
  
  routes: {
    dashboard: {
      path: '/',
      component: 'DashboardView',
      title: 'Dashboard',
      icon: 'DashboardOutlined',
      requiresConnection: false,
      hidden: false
    },
    
    controls: {
      path: '/controls',
      component: 'ControlsView', 
      title: 'Jog Controls',
      icon: 'ControlOutlined',
      requiresConnection: true,
      hidden: false
    },
    
    machine: {
      path: '/machine',
      component: 'MachineView',
      title: 'Machine',
      icon: 'SettingOutlined',
      requiresConnection: false,
      hidden: true,
      children: {
        setup: {
          path: '/setup',
          component: 'MachineSetupView',
          title: 'Machine Setup',
          icon: 'ToolOutlined',
          requiresConnection: true
        },
        diagnostics: {
          path: '/diagnostics', 
          component: 'DiagnosticsView',
          title: 'Diagnostics',
          icon: 'ExperimentOutlined',
          requiresConnection: true
        },
        settings: {
          path: '/settings',
          component: 'MachineSettingsView',
          title: 'Machine Settings',
          icon: 'SettingOutlined',
          requiresConnection: false
        }
      }
    },
    
    workspace: {
      path: '/workspace',
      component: 'WorkspaceView',
      title: 'Workspace',
      icon: 'AppstoreOutlined',
      requiresConnection: false,
      hidden: true,
      children: {
        setup: {
          path: '/setup',
          component: 'WorkspaceSetupView',
          title: 'Workspace Setup',
          icon: 'BorderOutlined',
          requiresConnection: false
        },
        preview: {
          path: '/preview',
          component: 'WorkspacePreviewView',
          title: 'Workspace Preview',
          icon: 'EyeOutlined',
          requiresConnection: false
        }
      }
    },
    
    tools: {
      path: '/tools',
      component: 'ToolsView',
      title: 'Tools',
      icon: 'ToolOutlined',
      requiresConnection: false,
      hidden: true,
      children: {
        library: {
          path: '/library',
          component: 'ToolLibraryView',
          title: 'Tool Library',
          icon: 'DatabaseOutlined',
          requiresConnection: false
        },
        calibration: {
          path: '/calibration',
          component: 'ToolCalibrationView',
          title: 'Tool Calibration',
          icon: 'AimOutlined',
          requiresConnection: true
        }
      }
    },
    
    programs: {
      path: '/programs',
      component: 'ProgramsView',
      title: 'Programs',
      icon: 'FileOutlined',
      requiresConnection: false,
      hidden: true,
      children: {
        library: {
          path: '/library',
          component: 'ProgramLibraryView',
          title: 'Program Library',
          icon: 'FolderOutlined',
          requiresConnection: false
        },
        editor: {
          path: '/editor',
          component: 'ProgramEditorView',
          title: 'G-code Editor',
          icon: 'EditOutlined',
          requiresConnection: false
        },
        history: {
          path: '/history',
          component: 'ProgramHistoryView',
          title: 'Job History',
          icon: 'HistoryOutlined',
          requiresConnection: false
        }
      }
    },
    
    settings: {
      path: '/settings',
      component: 'SettingsView',
      title: 'Settings',
      icon: 'SettingOutlined',
      requiresConnection: false,
      hidden: true,
      children: {
        units: {
          path: '/units',
          component: 'UnitsSettingsView',
          title: 'Units',
          icon: 'NumberOutlined',
          requiresConnection: false
        },
        interface: {
          path: '/interface',
          component: 'InterfaceSettingsView',
          title: 'Interface',
          icon: 'SkinOutlined',
          requiresConnection: false
        },
        advanced: {
          path: '/advanced',
          component: 'AdvancedSettingsView',
          title: 'Advanced',
          icon: 'ExperimentOutlined',
          requiresConnection: false
        }
      }
    },
    
    help: {
      path: '/help',
      component: 'HelpView',
      title: 'Help',
      icon: 'QuestionCircleOutlined',
      requiresConnection: false,
      hidden: true,
      children: {
        guides: {
          path: '/guides',
          component: 'GuidesView',
          title: 'User Guides',
          icon: 'BookOutlined',
          requiresConnection: false
        },
        troubleshooting: {
          path: '/troubleshooting',
          component: 'TroubleshootingView',
          title: 'Troubleshooting',
          icon: 'BugOutlined',
          requiresConnection: false
        }
      }
    }
  }
};

// Route validation settings
export const routeValidation = {
  maxDepth: 3,
  allowedCharacters: /^[a-zA-Z0-9-_/]+$/,
  reservedPaths: ['api', 'admin', 'config']
};

// Navigation settings
export const navigationConfig = {
  enableAnimations: true,
  animationDuration: 300,
  enableKeyboardShortcuts: true,
  enableSwipeNavigation: false,
  keepScrollPosition: true
};
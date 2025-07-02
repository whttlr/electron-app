import { Plugin } from '../PluginContext';

export const mockPlugins: Plugin[] = [
  {
    id: 'mock-dashboard-plugin',
    name: 'Mock Dashboard Plugin',
    version: '1.0.0',
    description: 'A mock plugin for dashboard testing',
    status: 'active',
    type: 'utility',
    config: {
      placement: 'dashboard',
      screen: 'main',
      size: { width: 300, height: 200 },
      priority: 100,
      autoStart: true,
      permissions: ['read'],
    },
  },
  {
    id: 'mock-standalone-plugin',
    name: 'Mock Standalone Plugin',
    version: '2.0.0',
    description: 'A mock standalone plugin for testing',
    status: 'active',
    type: 'visualization',
    config: {
      placement: 'standalone',
      screen: 'new',
      size: { width: 'auto', height: 'auto' },
      priority: 200,
      autoStart: false,
      permissions: ['read', 'write'],
      menuTitle: 'Mock Standalone',
      menuIcon: 'monitor',
      routePath: '/mock-standalone',
    },
  },
  {
    id: 'mock-modal-plugin',
    name: 'Mock Modal Plugin',
    version: '1.5.0',
    description: 'A mock modal plugin for testing',
    status: 'active',
    type: 'control',
    config: {
      placement: 'modal',
      screen: 'controls',
      size: { width: 600, height: 400 },
      priority: 150,
      autoStart: false,
      permissions: ['machine.control'],
    },
  },
  {
    id: 'mock-inactive-plugin',
    name: 'Mock Inactive Plugin',
    version: '0.9.0',
    description: 'A mock inactive plugin for testing',
    status: 'inactive',
    type: 'productivity',
    config: {
      placement: 'sidebar',
      screen: 'settings',
      size: { width: 250, height: 'auto' },
      priority: 50,
      autoStart: false,
      permissions: [],
    },
  },
];

export const mockStandalonePlugins = mockPlugins.filter(
  (plugin) => plugin.status === 'active' && plugin.config?.placement === 'standalone',
);

export const mockActivePlugins = mockPlugins.filter(
  (plugin) => plugin.status === 'active',
);

export const createMockPlugin = (overrides: Partial<Plugin> = {}): Plugin => ({
  id: 'test-plugin',
  name: 'Test Plugin',
  version: '1.0.0',
  description: 'A test plugin',
  status: 'active',
  type: 'utility',
  config: {
    placement: 'dashboard',
    screen: 'main',
    size: { width: 300, height: 200 },
    priority: 100,
    autoStart: false,
    permissions: [],
  },
  ...overrides,
});

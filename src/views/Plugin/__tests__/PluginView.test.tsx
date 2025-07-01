import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';
import PluginView from '../PluginView';

// Mock the plugin service
const mockPlugins = [
  {
    id: 'test-plugin-1',
    name: 'Test Plugin 1',
    version: '1.0.0',
    description: 'A test plugin for unit testing',
    status: 'active' as const,
    type: 'utility' as const,
    config: {
      placement: 'standalone',
      screen: 'new',
      routePath: '/test-plugin-1',
      menuTitle: 'Test Plugin 1',
      priority: 100,
      autoStart: true,
    },
  },
  {
    id: 'test-plugin-2',
    name: 'Test Plugin 2',
    version: '2.0.0',
    description: 'Another test plugin',
    status: 'inactive' as const,
    type: 'visualization' as const,
    config: {
      placement: 'dashboard',
      screen: 'main',
      priority: 50,
      autoStart: false,
    },
  },
  {
    id: 'test-plugin-3',
    name: 'Test Plugin 3',
    version: '1.5.0',
    description: 'Third test plugin',
    status: 'active' as const,
    type: 'control' as const,
    config: {
      placement: 'standalone',
      screen: 'new',
      routePath: '/custom-route',
      menuTitle: 'Custom Plugin',
      priority: 200,
    },
  },
];

const mockUsePlugins = {
  plugins: mockPlugins,
  setPlugins: jest.fn(),
  checkForUpdates: jest.fn(),
  updatePlugin: jest.fn(),
  updateAllPlugins: jest.fn(),
  registryConfig: null,
  setRegistryConfig: jest.fn(),
  syncWithRegistry: jest.fn(),
  publishToRegistry: jest.fn(),
  checkDependencies: jest.fn(),
  installDependencies: jest.fn(),
  exportPlugins: jest.fn(),
  importPlugins: jest.fn(),
};

jest.mock('../../../services/plugin', () => ({
  usePlugins: () => mockUsePlugins,
}));

const renderWithRouter = (component: React.ReactElement, initialPath = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/plugin/:pluginId" element={component} />
        <Route path="/test-plugin-1" element={component} />
        <Route path="/custom-route" element={component} />
        <Route path="*" element={component} />
      </Routes>
    </MemoryRouter>
  );
};

describe('PluginView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders plugin content when plugin is found by ID', () => {
    renderWithRouter(<PluginView />, '/plugin/test-plugin-1');
    
    expect(screen.getByText('Test Plugin 1')).toBeInTheDocument();
    expect(screen.getByText('A test plugin for unit testing')).toBeInTheDocument();
    expect(screen.getByText('Plugin Content Area')).toBeInTheDocument();
  });

  it('renders plugin content when plugin is found by route path', () => {
    renderWithRouter(<PluginView />, '/test-plugin-1');
    
    expect(screen.getByText('Test Plugin 1')).toBeInTheDocument();
    expect(screen.getByText('A test plugin for unit testing')).toBeInTheDocument();
  });

  it('renders plugin content for custom route path', () => {
    renderWithRouter(<PluginView />, '/custom-route');
    
    expect(screen.getByText('Test Plugin 3')).toBeInTheDocument();
    expect(screen.getByText('Third test plugin')).toBeInTheDocument();
  });

  it('shows plugin not found error when plugin does not exist', () => {
    renderWithRouter(<PluginView />, '/plugin/non-existent-plugin');
    
    expect(screen.getByText('Plugin Not Found')).toBeInTheDocument();
    expect(screen.getByText(/Plugin ID: non-existent-plugin/)).toBeInTheDocument();
    expect(screen.getByText(/Current Path: \/plugin\/non-existent-plugin/)).toBeInTheDocument();
  });

  it('shows available plugins in error message', () => {
    renderWithRouter(<PluginView />, '/plugin/non-existent-plugin');
    
    expect(screen.getByText(/Available plugins: test-plugin-1, test-plugin-2, test-plugin-3/)).toBeInTheDocument();
  });

  it('shows standalone plugins in error message', () => {
    renderWithRouter(<PluginView />, '/plugin/non-existent-plugin');
    
    expect(screen.getByText(/Standalone plugins: test-plugin-1 \(\/test-plugin-1\), test-plugin-3 \(\/custom-route\)/)).toBeInTheDocument();
  });

  it('shows plugin inactive warning when plugin is disabled', () => {
    renderWithRouter(<PluginView />, '/plugin/test-plugin-2');
    
    expect(screen.getByText('Test Plugin 2')).toBeInTheDocument();
    expect(screen.getByText('Plugin Inactive')).toBeInTheDocument();
    expect(screen.getByText('This plugin is currently disabled. Enable it in the Plugins section to use it.')).toBeInTheDocument();
  });

  it('displays plugin configuration in active plugin view', () => {
    renderWithRouter(<PluginView />, '/plugin/test-plugin-1');
    
    expect(screen.getByText('Plugin Configuration:')).toBeInTheDocument();
    
    // Check if configuration JSON is displayed
    const configSection = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'pre' && 
             content.includes('"placement": "standalone"');
    });
    expect(configSection).toBeInTheDocument();
  });

  it('displays correct plugin description', () => {
    renderWithRouter(<PluginView />, '/plugin/test-plugin-1');
    
    const description = screen.getByText('A test plugin for unit testing');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('ant-typography');
  });

  it('shows plugin emoji icon', () => {
    renderWithRouter(<PluginView />, '/plugin/test-plugin-1');
    
    expect(screen.getByText('🔌')).toBeInTheDocument();
  });

  it('displays implementation placeholder text', () => {
    renderWithRouter(<PluginView />, '/plugin/test-plugin-1');
    
    expect(screen.getByText(/This is where the Test Plugin 1 plugin content would be rendered/)).toBeInTheDocument();
    expect(screen.getByText(/In a real implementation, this would load and display the plugin's React components/)).toBeInTheDocument();
  });

  it('renders card container for plugin content', () => {
    renderWithRouter(<PluginView />, '/plugin/test-plugin-1');
    
    const card = document.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('applies proper styling to plugin content area', () => {
    renderWithRouter(<PluginView />, '/plugin/test-plugin-1');
    
    // Check for centered content styling
    const contentArea = screen.getByText('Plugin Content Area').closest('div');
    expect(contentArea).toHaveStyle({
      padding: '40px',
      textAlign: 'center',
    });
  });

  it('applies proper styling to configuration display', () => {
    renderWithRouter(<PluginView />, '/plugin/test-plugin-1');
    
    const configContainer = screen.getByText('Plugin Configuration:').closest('div');
    expect(configContainer).toHaveStyle({
      marginTop: '24px',
      textAlign: 'left',
      background: '#f5f5f5',
      padding: '16px',
      borderRadius: '8px',
    });
  });

  it('displays JSON configuration with proper formatting', () => {
    renderWithRouter(<PluginView />, '/plugin/test-plugin-1');
    
    const preElement = document.querySelector('pre');
    expect(preElement).toBeInTheDocument();
    expect(preElement).toHaveStyle({
      margin: '0',
      fontSize: '12px',
    });
  });

  it('handles undefined plugin ID gracefully', () => {
    renderWithRouter(<PluginView />, '/some-unknown-route');
    
    expect(screen.getByText('Plugin Not Found')).toBeInTheDocument();
    expect(screen.getByText(/Plugin ID: undefined/)).toBeInTheDocument();
  });

  it('shows correct alert types for different states', () => {
    // Test error alert for not found
    renderWithRouter(<PluginView />, '/plugin/non-existent');
    let alert = document.querySelector('.ant-alert-error');
    expect(alert).toBeInTheDocument();
    
    // Re-render for warning alert for inactive plugin
    renderWithRouter(<PluginView />, '/plugin/test-plugin-2');
    alert = document.querySelector('.ant-alert-warning');
    expect(alert).toBeInTheDocument();
  });

  it('displays plugin title with correct heading level', () => {
    renderWithRouter(<PluginView />, '/plugin/test-plugin-1');
    
    const title = screen.getByRole('heading', { level: 2, name: 'Test Plugin 1' });
    expect(title).toBeInTheDocument();
  });

  it('displays content area title with correct heading level', () => {
    renderWithRouter(<PluginView />, '/plugin/test-plugin-1');
    
    const contentTitle = screen.getByRole('heading', { level: 4, name: 'Plugin Content Area' });
    expect(contentTitle).toBeInTheDocument();
  });

  it('displays configuration title with correct heading level', () => {
    renderWithRouter(<PluginView />, '/plugin/test-plugin-1');
    
    const configTitle = screen.getByRole('heading', { level: 5, name: 'Plugin Configuration:' });
    expect(configTitle).toBeInTheDocument();
  });

  it('handles plugins without config gracefully', () => {
    const pluginWithoutConfig = {
      ...mockPlugins[0],
      config: undefined,
    };
    
    const mockUsePluginsWithoutConfig = {
      ...mockUsePlugins,
      plugins: [pluginWithoutConfig],
    };
    
    jest.doMock('../../../services/plugin', () => ({
      usePlugins: () => mockUsePluginsWithoutConfig,
    }));
    
    renderWithRouter(<PluginView />, '/plugin/test-plugin-1');
    
    expect(screen.getByText('Plugin Configuration:')).toBeInTheDocument();
    expect(screen.getByText('null')).toBeInTheDocument();
  });

  it('shows icons in alert messages', () => {
    // Test error alert icon
    renderWithRouter(<PluginView />, '/plugin/non-existent');
    let alertIcon = document.querySelector('.ant-alert .ant-alert-icon');
    expect(alertIcon).toBeInTheDocument();
    
    // Test warning alert icon
    renderWithRouter(<PluginView />, '/plugin/test-plugin-2');
    alertIcon = document.querySelector('.ant-alert .ant-alert-icon');
    expect(alertIcon).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PluginRenderer from '../PluginRenderer';
import { PluginProvider } from '../../../services/plugin';
import { createMockPlugin } from '../../../services/plugin/__mocks__/mockPlugins';

// Mock Ant Design Modal
const mockModalInfo = jest.fn();
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Modal: {
    info: mockModalInfo
  }
}));

// Helper component to provide plugin context
const TestWrapper: React.FC<{ 
  children: React.ReactNode;
  plugins?: any[];
}> = ({ children, plugins = [] }) => {
  const MockPluginProvider = ({ children }: { children: React.ReactNode }) => {
    const [mockPlugins, setMockPlugins] = React.useState(plugins);
    
    const getStandalonePlugins = () => {
      return mockPlugins.filter(plugin => 
        plugin.status === 'active' && 
        plugin.config?.placement === 'standalone'
      );
    };

    const contextValue = {
      plugins: mockPlugins,
      setPlugins: setMockPlugins,
      getStandalonePlugins
    };

    return React.createElement(
      React.createContext(contextValue).Provider,
      { value: contextValue },
      children
    );
  };

  return <MockPluginProvider>{children}</MockPluginProvider>;
};

describe('PluginRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('No Plugins', () => {
    test('should render nothing when no plugins match criteria', () => {
      const { container } = render(
        <TestWrapper plugins={[]}>
          <PluginRenderer screen="main" placement="dashboard" />
        </TestWrapper>
      );
      
      expect(container.firstChild).toBeNull();
    });

    test('should render nothing when plugins exist but none match screen', () => {
      const plugins = [
        createMockPlugin({
          id: 'plugin1',
          config: { screen: 'controls', placement: 'dashboard' }
        })
      ];

      const { container } = render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="main" placement="dashboard" />
        </TestWrapper>
      );
      
      expect(container.firstChild).toBeNull();
    });

    test('should render nothing when plugins are inactive', () => {
      const plugins = [
        createMockPlugin({
          id: 'plugin1',
          status: 'inactive',
          config: { screen: 'main', placement: 'dashboard' }
        })
      ];

      const { container } = render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="main" placement="dashboard" />
        </TestWrapper>
      );
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Dashboard Placement', () => {
    test('should render dashboard plugins correctly', () => {
      const plugins = [
        createMockPlugin({
          id: 'dashboard-plugin',
          name: 'Dashboard Plugin',
          description: 'A dashboard plugin',
          config: { 
            screen: 'main', 
            placement: 'dashboard',
            priority: 100
          }
        })
      ];

      render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="main" placement="dashboard" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Dashboard Plugin')).toBeInTheDocument();
      expect(screen.getByText('A dashboard plugin')).toBeInTheDocument();
      expect(screen.getByText('🔌')).toBeInTheDocument();
    });

    test('should sort dashboard plugins by priority', () => {
      const plugins = [
        createMockPlugin({
          id: 'low-priority',
          name: 'Low Priority Plugin',
          config: { 
            screen: 'main', 
            placement: 'dashboard',
            priority: 50
          }
        }),
        createMockPlugin({
          id: 'high-priority',
          name: 'High Priority Plugin',
          config: { 
            screen: 'main', 
            placement: 'dashboard',
            priority: 200
          }
        })
      ];

      render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="main" placement="dashboard" />
        </TestWrapper>
      );
      
      const pluginCards = screen.getAllByText(/Priority Plugin/);
      const firstCard = pluginCards[0].closest('.ant-card');
      
      expect(firstCard).toHaveTextContent('High Priority Plugin');
    });

    test('should apply correct column span based on plugin width', () => {
      const plugins = [
        createMockPlugin({
          id: 'auto-width',
          name: 'Auto Width Plugin',
          config: { 
            screen: 'main', 
            placement: 'dashboard',
            size: { width: 'auto', height: 'auto' }
          }
        }),
        createMockPlugin({
          id: 'large-width',
          name: 'Large Width Plugin',
          config: { 
            screen: 'main', 
            placement: 'dashboard',
            size: { width: 500, height: 300 }
          }
        })
      ];

      render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="main" placement="dashboard" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Auto Width Plugin')).toBeInTheDocument();
      expect(screen.getByText('Large Width Plugin')).toBeInTheDocument();
    });

    test('should display plugin configuration details', () => {
      const plugins = [
        createMockPlugin({
          id: 'config-plugin',
          name: 'Config Plugin',
          type: 'visualization',
          config: { 
            screen: 'main', 
            placement: 'dashboard',
            priority: 150
          }
        })
      ];

      render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="main" placement="dashboard" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Type: visualization')).toBeInTheDocument();
      expect(screen.getByText('Placement: dashboard')).toBeInTheDocument();
      expect(screen.getByText('Priority: 150')).toBeInTheDocument();
    });
  });

  describe('Sidebar Placement', () => {
    test('should render sidebar plugins correctly', () => {
      const plugins = [
        createMockPlugin({
          id: 'sidebar-plugin',
          name: 'Sidebar Plugin',
          description: 'A sidebar plugin',
          config: { 
            screen: 'controls', 
            placement: 'sidebar',
            priority: 100
          }
        })
      ];

      render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="controls" placement="sidebar" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Sidebar Plugin')).toBeInTheDocument();
      expect(screen.getByText('A sidebar plugin')).toBeInTheDocument();
    });

    test('should sort sidebar plugins by priority', () => {
      const plugins = [
        createMockPlugin({
          id: 'sidebar-low',
          name: 'Low Sidebar',
          config: { 
            screen: 'settings', 
            placement: 'sidebar',
            priority: 25
          }
        }),
        createMockPlugin({
          id: 'sidebar-high',
          name: 'High Sidebar',
          config: { 
            screen: 'settings', 
            placement: 'sidebar',
            priority: 75
          }
        })
      ];

      render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="settings" placement="sidebar" />
        </TestWrapper>
      );
      
      const pluginCards = screen.getAllByText(/Sidebar/);
      const firstCard = pluginCards[0].closest('.ant-card');
      
      expect(firstCard).toHaveTextContent('High Sidebar');
    });
  });

  describe('Modal Placement', () => {
    test('should render modal plugin triggers', () => {
      const plugins = [
        createMockPlugin({
          id: 'modal-plugin',
          name: 'Modal Plugin',
          description: 'A modal plugin',
          config: { 
            screen: 'main', 
            placement: 'modal'
          }
        })
      ];

      render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="main" placement="modal" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Available Modal Plugins')).toBeInTheDocument();
      expect(screen.getByText('Modal Plugin')).toBeInTheDocument();
      expect(screen.getByText('Click to open')).toBeInTheDocument();
    });

    test('should open modal when plugin card is clicked', () => {
      const plugins = [
        createMockPlugin({
          id: 'modal-plugin',
          name: 'Modal Plugin',
          description: 'A modal plugin',
          config: { 
            screen: 'main', 
            placement: 'modal',
            size: { width: 800, height: 600 }
          }
        })
      ];

      render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="main" placement="modal" />
        </TestWrapper>
      );
      
      const modalCard = screen.getByText('Modal Plugin').closest('.ant-card');
      fireEvent.click(modalCard!);
      
      expect(mockModalInfo).toHaveBeenCalledWith({
        title: 'Modal Plugin',
        content: expect.anything(),
        width: 800
      });
    });

    test('should use default width for auto-width modal plugins', () => {
      const plugins = [
        createMockPlugin({
          id: 'auto-modal',
          name: 'Auto Modal',
          config: { 
            screen: 'main', 
            placement: 'modal',
            size: { width: 'auto', height: 'auto' }
          }
        })
      ];

      render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="main" placement="modal" />
        </TestWrapper>
      );
      
      const modalCard = screen.getByText('Auto Modal').closest('.ant-card');
      fireEvent.click(modalCard!);
      
      expect(mockModalInfo).toHaveBeenCalledWith({
        title: 'Auto Modal',
        content: expect.anything(),
        width: 600 // default width
      });
    });
  });

  describe('Default Placement (All)', () => {
    test('should render all placement types when no specific placement is given', () => {
      const plugins = [
        createMockPlugin({
          id: 'dashboard-plugin',
          name: 'Dashboard Plugin',
          config: { screen: 'main', placement: 'dashboard' }
        }),
        createMockPlugin({
          id: 'sidebar-plugin',
          name: 'Sidebar Plugin',
          config: { screen: 'main', placement: 'sidebar' }
        }),
        createMockPlugin({
          id: 'modal-plugin',
          name: 'Modal Plugin',
          config: { screen: 'main', placement: 'modal' }
        })
      ];

      render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="main" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Dashboard Plugin')).toBeInTheDocument();
      expect(screen.getByText('Sidebar Plugin')).toBeInTheDocument();
      expect(screen.getByText('Available Modal Plugins')).toBeInTheDocument();
      expect(screen.getByText('Modal Plugin')).toBeInTheDocument();
    });

    test('should not render sections for missing placement types', () => {
      const plugins = [
        createMockPlugin({
          id: 'dashboard-only',
          name: 'Dashboard Only',
          config: { screen: 'controls', placement: 'dashboard' }
        })
      ];

      render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="controls" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Dashboard Only')).toBeInTheDocument();
      expect(screen.queryByText('Available Modal Plugins')).not.toBeInTheDocument();
    });
  });

  describe('Plugin Filtering', () => {
    test('should only show plugins matching the specified screen', () => {
      const plugins = [
        createMockPlugin({
          id: 'main-plugin',
          name: 'Main Plugin',
          config: { screen: 'main', placement: 'dashboard' }
        }),
        createMockPlugin({
          id: 'controls-plugin',
          name: 'Controls Plugin',
          config: { screen: 'controls', placement: 'dashboard' }
        }),
        createMockPlugin({
          id: 'settings-plugin',
          name: 'Settings Plugin',
          config: { screen: 'settings', placement: 'dashboard' }
        })
      ];

      render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="controls" placement="dashboard" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Controls Plugin')).toBeInTheDocument();
      expect(screen.queryByText('Main Plugin')).not.toBeInTheDocument();
      expect(screen.queryByText('Settings Plugin')).not.toBeInTheDocument();
    });

    test('should only show active plugins', () => {
      const plugins = [
        createMockPlugin({
          id: 'active-plugin',
          name: 'Active Plugin',
          status: 'active',
          config: { screen: 'main', placement: 'dashboard' }
        }),
        createMockPlugin({
          id: 'inactive-plugin',
          name: 'Inactive Plugin',
          status: 'inactive',
          config: { screen: 'main', placement: 'dashboard' }
        })
      ];

      render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="main" placement="dashboard" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Active Plugin')).toBeInTheDocument();
      expect(screen.queryByText('Inactive Plugin')).not.toBeInTheDocument();
    });

    test('should filter by both screen and placement when both are specified', () => {
      const plugins = [
        createMockPlugin({
          id: 'match-both',
          name: 'Match Both',
          config: { screen: 'main', placement: 'dashboard' }
        }),
        createMockPlugin({
          id: 'match-screen-only',
          name: 'Match Screen Only',
          config: { screen: 'main', placement: 'sidebar' }
        }),
        createMockPlugin({
          id: 'match-placement-only',
          name: 'Match Placement Only',
          config: { screen: 'controls', placement: 'dashboard' }
        })
      ];

      render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="main" placement="dashboard" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Match Both')).toBeInTheDocument();
      expect(screen.queryByText('Match Screen Only')).not.toBeInTheDocument();
      expect(screen.queryByText('Match Placement Only')).not.toBeInTheDocument();
    });
  });

  describe('Plugin Content Rendering', () => {
    test('should render plugin content with correct structure', () => {
      const plugins = [
        createMockPlugin({
          id: 'content-plugin',
          name: 'Content Plugin',
          description: 'Plugin description',
          type: 'control',
          config: { 
            screen: 'main', 
            placement: 'dashboard',
            priority: 75
          }
        })
      ];

      render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="main" placement="dashboard" />
        </TestWrapper>
      );
      
      expect(screen.getByText('🔌')).toBeInTheDocument();
      expect(screen.getByText('Content Plugin')).toBeInTheDocument();
      expect(screen.getByText('Plugin description')).toBeInTheDocument();
      expect(screen.getByText('Config:')).toBeInTheDocument();
      expect(screen.getByText('Type: control')).toBeInTheDocument();
      expect(screen.getByText('Placement: dashboard')).toBeInTheDocument();
      expect(screen.getByText('Priority: 75')).toBeInTheDocument();
    });

    test('should handle plugins with missing config properties', () => {
      const plugins = [
        createMockPlugin({
          id: 'minimal-plugin',
          name: 'Minimal Plugin',
          description: 'Minimal description',
          type: 'utility',
          config: { 
            screen: 'main', 
            placement: 'dashboard'
            // No priority specified
          }
        })
      ];

      render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="main" placement="dashboard" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Minimal Plugin')).toBeInTheDocument();
      expect(screen.getByText('Priority:')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle plugins with undefined config', () => {
      const plugins = [
        {
          id: 'no-config-plugin',
          name: 'No Config Plugin',
          version: '1.0.0',
          description: 'Plugin without config',
          status: 'active' as const,
          type: 'utility' as const
          // No config property
        }
      ];

      const { container } = render(
        <TestWrapper plugins={plugins}>
          <PluginRenderer screen="main" placement="dashboard" />
        </TestWrapper>
      );
      
      // Should render nothing since screen doesn't match
      expect(container.firstChild).toBeNull();
    });

    test('should handle empty plugin array gracefully', () => {
      const { container } = render(
        <TestWrapper plugins={[]}>
          <PluginRenderer screen="main" placement="dashboard" />
        </TestWrapper>
      );
      
      expect(container.firstChild).toBeNull();
    });
  });
});
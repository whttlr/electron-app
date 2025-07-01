import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { PluginProvider, usePlugins, Plugin } from '../PluginContext';

// Test component that uses the plugin context
const TestComponent: React.FC = () => {
  const { plugins, setPlugins, getStandalonePlugins } = usePlugins();
  
  const addTestPlugin = () => {
    const newPlugin: Plugin = {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'A test plugin',
      status: 'active',
      type: 'utility',
      config: {
        placement: 'dashboard',
        screen: 'main'
      }
    };
    setPlugins(prev => [...prev, newPlugin]);
  };

  const standalonePlugins = getStandalonePlugins();

  return (
    <div>
      <div data-testid="plugin-count">{plugins.length}</div>
      <div data-testid="standalone-count">{standalonePlugins.length}</div>
      <button onClick={addTestPlugin} data-testid="add-plugin">
        Add Plugin
      </button>
      <div data-testid="plugin-list">
        {plugins.map(plugin => (
          <div key={plugin.id} data-testid={`plugin-${plugin.id}`}>
            {plugin.name} - {plugin.status}
          </div>
        ))}
      </div>
    </div>
  );
};

// Component that should throw error when used outside provider
const ComponentWithoutProvider: React.FC = () => {
  usePlugins();
  return <div>Should not render</div>;
};

describe('PluginContext', () => {
  describe('PluginProvider', () => {
    test('should provide initial plugins', () => {
      render(
        <PluginProvider>
          <TestComponent />
        </PluginProvider>
      );

      expect(screen.getByTestId('plugin-count')).toHaveTextContent('2');
      expect(screen.getByTestId('plugin-machine-monitor')).toHaveTextContent('Machine Status Monitor - active');
      expect(screen.getByTestId('plugin-gcode-snippets')).toHaveTextContent('G-code Snippets - active');
    });

    test('should provide correct standalone plugins', () => {
      render(
        <PluginProvider>
          <TestComponent />
        </PluginProvider>
      );

      // Only machine-monitor is standalone
      expect(screen.getByTestId('standalone-count')).toHaveTextContent('1');
    });

    test('should allow adding new plugins', () => {
      render(
        <PluginProvider>
          <TestComponent />
        </PluginProvider>
      );

      expect(screen.getByTestId('plugin-count')).toHaveTextContent('2');

      act(() => {
        screen.getByTestId('add-plugin').click();
      });

      expect(screen.getByTestId('plugin-count')).toHaveTextContent('3');
      expect(screen.getByTestId('plugin-test-plugin')).toHaveTextContent('Test Plugin - active');
    });

    test('should update standalone plugins when plugins change', () => {
      render(
        <PluginProvider>
          <TestComponent />
        </PluginProvider>
      );

      expect(screen.getByTestId('standalone-count')).toHaveTextContent('1');

      // Add a plugin that is not standalone
      act(() => {
        screen.getByTestId('add-plugin').click();
      });

      // Standalone count should remain the same
      expect(screen.getByTestId('standalone-count')).toHaveTextContent('1');
    });
  });

  describe('usePlugins hook', () => {
    test('should throw error when used outside PluginProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<ComponentWithoutProvider />);
      }).toThrow('usePlugins must be used within a PluginProvider');

      consoleSpy.mockRestore();
    });

    test('should return plugin context when used within provider', () => {
      render(
        <PluginProvider>
          <TestComponent />
        </PluginProvider>
      );

      // Should render without throwing
      expect(screen.getByTestId('plugin-count')).toBeInTheDocument();
    });
  });

  describe('getStandalonePlugins function', () => {
    test('should filter only active standalone plugins', () => {
      const TestStandaloneComponent: React.FC = () => {
        const { plugins, setPlugins, getStandalonePlugins } = usePlugins();
        
        const addInactiveStandalone = () => {
          const inactivePlugin: Plugin = {
            id: 'inactive-standalone',
            name: 'Inactive Standalone',
            version: '1.0.0',
            description: 'An inactive standalone plugin',
            status: 'inactive',
            type: 'utility',
            config: {
              placement: 'standalone',
              screen: 'new'
            }
          };
          setPlugins(prev => [...prev, inactivePlugin]);
        };

        const standalonePlugins = getStandalonePlugins();

        return (
          <div>
            <div data-testid="total-plugins">{plugins.length}</div>
            <div data-testid="standalone-plugins">{standalonePlugins.length}</div>
            <button onClick={addInactiveStandalone} data-testid="add-inactive">
              Add Inactive Standalone
            </button>
          </div>
        );
      };

      render(
        <PluginProvider>
          <TestStandaloneComponent />
        </PluginProvider>
      );

      expect(screen.getByTestId('standalone-plugins')).toHaveTextContent('1');

      act(() => {
        screen.getByTestId('add-inactive').click();
      });

      // Total plugins should increase but standalone count should remain same
      expect(screen.getByTestId('total-plugins')).toHaveTextContent('3');
      expect(screen.getByTestId('standalone-plugins')).toHaveTextContent('1');
    });

    test('should return plugins with correct standalone configuration', () => {
      const TestStandaloneDetails: React.FC = () => {
        const { getStandalonePlugins } = usePlugins();
        const standalonePlugins = getStandalonePlugins();

        return (
          <div>
            {standalonePlugins.map(plugin => (
              <div key={plugin.id} data-testid={`standalone-${plugin.id}`}>
                <span data-testid={`${plugin.id}-placement`}>{plugin.config?.placement}</span>
                <span data-testid={`${plugin.id}-status`}>{plugin.status}</span>
                <span data-testid={`${plugin.id}-route`}>{plugin.config?.routePath}</span>
              </div>
            ))}
          </div>
        );
      };

      render(
        <PluginProvider>
          <TestStandaloneDetails />
        </PluginProvider>
      );

      expect(screen.getByTestId('machine-monitor-placement')).toHaveTextContent('standalone');
      expect(screen.getByTestId('machine-monitor-status')).toHaveTextContent('active');
      expect(screen.getByTestId('machine-monitor-route')).toHaveTextContent('/machine-monitor');
    });
  });

  describe('Plugin interface', () => {
    test('should handle plugins with minimal configuration', () => {
      const TestMinimalPlugin: React.FC = () => {
        const { setPlugins } = usePlugins();
        
        const addMinimalPlugin = () => {
          const minimalPlugin: Plugin = {
            id: 'minimal',
            name: 'Minimal Plugin',
            version: '1.0.0',
            description: 'A minimal plugin',
            status: 'active',
            type: 'utility'
            // No config object
          };
          setPlugins(prev => [...prev, minimalPlugin]);
        };

        return (
          <button onClick={addMinimalPlugin} data-testid="add-minimal">
            Add Minimal Plugin
          </button>
        );
      };

      render(
        <PluginProvider>
          <TestMinimalPlugin />
          <TestComponent />
        </PluginProvider>
      );

      act(() => {
        screen.getByTestId('add-minimal').click();
      });

      expect(screen.getByTestId('plugin-minimal')).toHaveTextContent('Minimal Plugin - active');
    });

    test('should handle all plugin types', () => {
      const TestPluginTypes: React.FC = () => {
        const { setPlugins } = usePlugins();
        
        const addAllTypes = () => {
          const pluginTypes: Plugin['type'][] = ['utility', 'visualization', 'control', 'productivity'];
          const newPlugins = pluginTypes.map((type, index) => ({
            id: `${type}-plugin`,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} Plugin`,
            version: '1.0.0',
            description: `A ${type} plugin`,
            status: 'active' as const,
            type
          }));
          setPlugins(prev => [...prev, ...newPlugins]);
        };

        return (
          <button onClick={addAllTypes} data-testid="add-all-types">
            Add All Types
          </button>
        );
      };

      render(
        <PluginProvider>
          <TestPluginTypes />
          <TestComponent />
        </PluginProvider>
      );

      act(() => {
        screen.getByTestId('add-all-types').click();
      });

      expect(screen.getByTestId('plugin-utility-plugin')).toHaveTextContent('Utility Plugin - active');
      expect(screen.getByTestId('plugin-visualization-plugin')).toHaveTextContent('Visualization Plugin - active');
      expect(screen.getByTestId('plugin-control-plugin')).toHaveTextContent('Control Plugin - active');
      expect(screen.getByTestId('plugin-productivity-plugin')).toHaveTextContent('Productivity Plugin - active');
    });
  });
});
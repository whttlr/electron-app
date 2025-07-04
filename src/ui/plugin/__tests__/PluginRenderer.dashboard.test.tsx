import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PluginRenderer from '../PluginRenderer';
import { createMockPlugin } from '../../../services/plugin/__mocks__/mockPlugins';

// Helper component to provide plugin context
const TestWrapper: React.FC<{
  children: React.ReactNode;
  plugins?: any[];
}> = ({ children, plugins = [] }) => {
  const MockPluginProvider = ({ children }: { children: React.ReactNode }) => {
    const [mockPlugins, setMockPlugins] = React.useState(plugins);

    const getStandalonePlugins = () => mockPlugins.filter((plugin) => plugin.status === 'active'
        && plugin.config?.placement === 'standalone');

    const contextValue = {
      plugins: mockPlugins,
      setPlugins: setMockPlugins,
      getStandalonePlugins,
    };

    return React.createElement(
      React.createContext(contextValue).Provider,
      { value: contextValue },
      children,
    );
  };

  return <MockPluginProvider>{children}</MockPluginProvider>;
};

describe('PluginRenderer - Dashboard Placement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render dashboard plugins correctly', () => {
    const mockPlugin = createMockPlugin({
      id: 'dashboard-plugin',
      config: {
        placement: 'dashboard',
        screen: 'dashboard',
        size: { width: 300, height: 200 },
        priority: 100,
        autoStart: false,
        permissions: [],
      },
    });

    render(
      <TestWrapper plugins={[mockPlugin]}>
        <PluginRenderer screen="dashboard" placement="dashboard" />
      </TestWrapper>,
    );

    expect(screen.getByText('Test Plugin')).toBeInTheDocument();
  });

  test('should sort dashboard plugins by priority', () => {
    const lowPriorityPlugin = createMockPlugin({
      id: 'low-priority',
      name: 'Low Priority Plugin',
      config: {
        placement: 'dashboard',
        screen: 'dashboard',
        size: { width: 300, height: 200 },
        priority: 50,
        autoStart: false,
        permissions: [],
      },
    });

    const highPriorityPlugin = createMockPlugin({
      id: 'high-priority',
      name: 'High Priority Plugin',
      config: {
        placement: 'dashboard',
        screen: 'dashboard',
        size: { width: 300, height: 200 },
        priority: 200,
        autoStart: false,
        permissions: [],
      },
    });

    render(
      <TestWrapper plugins={[lowPriorityPlugin, highPriorityPlugin]}>
        <PluginRenderer screen="dashboard" placement="dashboard" />
      </TestWrapper>,
    );

    const pluginCards = screen.getAllByText(/Priority Plugin/);
    expect(pluginCards).toHaveLength(2);
    const firstCard = pluginCards[0].closest('.ant-card');
    expect(firstCard).toHaveTextContent('High Priority Plugin');
  });

  test('should apply correct column span based on plugin width', () => {
    const widePlugin = createMockPlugin({
      id: 'wide-plugin',
      name: 'Wide Plugin',
      config: {
        placement: 'dashboard',
        screen: 'dashboard',
        size: { width: 600, height: 200 },
        priority: 100,
        autoStart: false,
        permissions: [],
      },
    });

    render(
      <TestWrapper plugins={[widePlugin]}>
        <PluginRenderer screen="dashboard" placement="dashboard" />
      </TestWrapper>,
    );

    const pluginCard = screen.getByText('Wide Plugin').closest('.ant-col');
    expect(pluginCard).toHaveClass('ant-col-24');
  });
});

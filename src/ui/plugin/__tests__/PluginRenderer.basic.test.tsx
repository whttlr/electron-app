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

describe('PluginRenderer - Basic Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('No Plugins', () => {
    test('should render nothing when no plugins match criteria', () => {
      render(
        <TestWrapper>
          <PluginRenderer screen="dashboard" placement="dashboard" />
        </TestWrapper>,
      );

      expect(screen.queryByText(/plugin/i)).not.toBeInTheDocument();
    });

    test('should render nothing when plugins exist but none match screen', () => {
      const mockPlugin = createMockPlugin({
        id: 'test-plugin',
        config: {
          placement: 'dashboard',
          screen: 'controls',
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

      expect(screen.queryByText('Test Plugin')).not.toBeInTheDocument();
    });

    test('should render nothing when plugins are inactive', () => {
      const mockPlugin = createMockPlugin({
        id: 'test-plugin',
        status: 'inactive',
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

      expect(screen.queryByText('Test Plugin')).not.toBeInTheDocument();
    });
  });
});
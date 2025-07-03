import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PluginRenderer from '../PluginRenderer';
import { createMockPlugin } from '../../../services/plugin/__mocks__/mockPlugins';

// Mock Ant Design Modal
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Modal: {
    info: jest.fn(),
  },
}));

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

// Get access to the mocked Modal
const { Modal } = jest.requireMock('antd');

describe('PluginRenderer - Modal Placement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render modal plugin triggers', () => {
    const plugins = [
      createMockPlugin({
        id: 'modal-plugin',
        name: 'Modal Plugin',
        config: {
          placement: 'modal',
          screen: 'dashboard',
          size: { width: 800, height: 600 },
          priority: 100,
          autoStart: false,
          permissions: [],
        },
      }),
    ];

    render(
      <TestWrapper plugins={plugins}>
        <PluginRenderer screen="dashboard" placement="modal" />
      </TestWrapper>,
    );

    expect(screen.getByText('Available Modal Plugins')).toBeInTheDocument();
    expect(screen.getByText('Modal Plugin')).toBeInTheDocument();
  });

  test('should open modal when plugin is clicked', () => {
    const plugins = [
      createMockPlugin({
        id: 'modal-plugin',
        name: 'Modal Plugin',
        config: {
          placement: 'modal',
          screen: 'dashboard',
          size: { width: 800, height: 600 },
          priority: 100,
          autoStart: false,
          permissions: [],
        },
      }),
    ];

    render(
      <TestWrapper plugins={plugins}>
        <PluginRenderer screen="dashboard" placement="modal" />
      </TestWrapper>,
    );

    const pluginButton = screen.getByText('Modal Plugin');
    fireEvent.click(pluginButton);

    expect(Modal.info).toHaveBeenCalledWith({
      title: 'Modal Plugin',
      content: expect.any(Object),
      width: 800,
    });
  });

  test('should use default modal width when not specified', () => {
    const plugins = [
      createMockPlugin({
        id: 'modal-plugin',
        name: 'Modal Plugin',
        config: {
          placement: 'modal',
          screen: 'dashboard',
          size: { height: 400 },
          priority: 100,
          autoStart: false,
          permissions: [],
        },
      }),
    ];

    render(
      <TestWrapper plugins={plugins}>
        <PluginRenderer screen="dashboard" placement="modal" />
      </TestWrapper>,
    );

    const pluginButton = screen.getByText('Modal Plugin');
    fireEvent.click(pluginButton);

    expect(Modal.info).toHaveBeenCalledWith({
      title: 'Modal Plugin',
      content: expect.any(Object),
      width: 600, // default width
    });
  });
});
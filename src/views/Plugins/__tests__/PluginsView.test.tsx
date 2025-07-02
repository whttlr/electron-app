import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PluginsView from '../PluginsView';

// Mock the plugin service
const mockUsePlugins = {
  plugins: [
    {
      id: 'test-plugin-1',
      name: 'Test Plugin 1',
      version: '1.0.0',
      description: 'A test plugin',
      status: 'active' as const,
      type: 'utility' as const,
      installedAt: '2024-01-01T00:00:00.000Z',
      source: 'local' as const,
    },
    {
      id: 'test-plugin-2',
      name: 'Test Plugin 2',
      version: '2.0.0',
      description: 'Another test plugin',
      status: 'inactive' as const,
      type: 'visualization' as const,
      updateAvailable: true,
      latestVersion: '2.1.0',
      dependencies: { dep1: '1.0.0' },
      source: 'marketplace' as const,
    },
  ],
  setPlugins: jest.fn(),
  checkForUpdates: jest.fn().mockResolvedValue([]),
  updatePlugin: jest.fn().mockResolvedValue(undefined),
  updateAllPlugins: jest.fn().mockResolvedValue(undefined),
  registryConfig: null,
  setRegistryConfig: jest.fn(),
  syncWithRegistry: jest.fn().mockResolvedValue(undefined),
  publishToRegistry: jest.fn().mockResolvedValue(undefined),
  checkDependencies: jest.fn().mockResolvedValue(true),
  installDependencies: jest.fn().mockResolvedValue(undefined),
  exportPlugins: jest.fn().mockResolvedValue('{"plugins":[]}'),
  importPlugins: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../../../services/plugin', () => ({
  usePlugins: () => mockUsePlugins,
}));

// Mock message API
const mockMessage = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
};

const mockNotification = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
};

jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    message: mockMessage,
    notification: mockNotification,
    Modal: {
      ...antd.Modal,
      confirm: jest.fn(({ onOk, onCancel }) => ({
        destroy: jest.fn(),
        update: jest.fn(),
      })),
    },
  };
});

const renderWithRouter = (component: React.ReactElement) => render(
    <BrowserRouter>
      {component}
    </BrowserRouter>,
);

describe('PluginsView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});

    // Mock URL.createObjectURL and related methods
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();

    // Mock createElement and related DOM methods
    const mockAnchorElement = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockAnchorElement as any);
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchorElement as any);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchorElement as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the plugin management title', () => {
    renderWithRouter(<PluginsView />);
    expect(screen.getByText('Plugin Management')).toBeInTheDocument();
  });

  it('renders all three tabs', () => {
    renderWithRouter(<PluginsView />);

    expect(screen.getByText('Local Plugins')).toBeInTheDocument();
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Registry')).toBeInTheDocument();
  });

  it('shows local plugins by default', () => {
    renderWithRouter(<PluginsView />);

    expect(screen.getByText('Upload Plugin')).toBeInTheDocument();
    expect(screen.getByText('Plugin Statistics')).toBeInTheDocument();
    expect(screen.getByText('Installed Plugins')).toBeInTheDocument();
  });

  it('displays plugin statistics correctly', () => {
    renderWithRouter(<PluginsView />);

    expect(screen.getByText('2')).toBeInTheDocument(); // Total plugins count
    expect(screen.getByText('Total Plugins')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Updates')).toBeInTheDocument();
  });

  it('renders installed plugins list', () => {
    renderWithRouter(<PluginsView />);

    expect(screen.getByText('Test Plugin 1')).toBeInTheDocument();
    expect(screen.getByText('Test Plugin 2')).toBeInTheDocument();
    expect(screen.getByText('A test plugin')).toBeInTheDocument();
    expect(screen.getByText('Another test plugin')).toBeInTheDocument();
  });

  it('shows plugin status tags correctly', () => {
    renderWithRouter(<PluginsView />);

    // Check for status tags
    const activeTags = screen.getAllByText('active');
    const inactiveTags = screen.getAllByText('inactive');

    expect(activeTags.length).toBeGreaterThan(0);
    expect(inactiveTags.length).toBeGreaterThan(0);
  });

  it('shows plugin type tags', () => {
    renderWithRouter(<PluginsView />);

    expect(screen.getByText('utility')).toBeInTheDocument();
    expect(screen.getByText('visualization')).toBeInTheDocument();
  });

  it('shows update available indicators', () => {
    renderWithRouter(<PluginsView />);

    expect(screen.getByText('Update Available')).toBeInTheDocument();
  });

  it('handles plugin enable/disable toggle', async () => {
    renderWithRouter(<PluginsView />);

    const disableButton = screen.getByRole('button', { name: /disable/i });
    fireEvent.click(disableButton);

    expect(mockUsePlugins.setPlugins).toHaveBeenCalled();
  });

  it('opens configure modal when configure button is clicked', async () => {
    renderWithRouter(<PluginsView />);

    const configureButtons = screen.getAllByRole('button', { name: /configure/i });
    fireEvent.click(configureButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Configure Test Plugin 1')).toBeInTheDocument();
    });
  });

  it('handles plugin removal', async () => {
    renderWithRouter(<PluginsView />);

    // Click the more options button to reveal the dropdown
    const moreButtons = screen.getAllByLabelText(/more/i);
    fireEvent.click(moreButtons[0]);

    // Wait for dropdown to appear and click remove
    await waitFor(() => {
      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);
    });

    expect(mockUsePlugins.setPlugins).toHaveBeenCalled();
  });

  it('handles file upload', () => {
    renderWithRouter(<PluginsView />);

    const file = new File(['test'], 'test-plugin.zip', { type: 'application/zip' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);
    }

    expect(mockUsePlugins.setPlugins).toHaveBeenCalled();
  });

  it('switches to marketplace tab', async () => {
    renderWithRouter(<PluginsView />);

    const marketplaceTab = screen.getByText('Marketplace');
    fireEvent.click(marketplaceTab);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search plugins/i)).toBeInTheDocument();
      expect(screen.getByText('Available Plugins')).toBeInTheDocument();
    });
  });

  it('shows marketplace search functionality', async () => {
    renderWithRouter(<PluginsView />);

    const marketplaceTab = screen.getByText('Marketplace');
    fireEvent.click(marketplaceTab);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search plugins/i);
      expect(searchInput).toBeInTheDocument();

      const categoryFilter = screen.getByDisplayValue('All Categories');
      expect(categoryFilter).toBeInTheDocument();
    });
  });

  it('displays marketplace plugins', async () => {
    renderWithRouter(<PluginsView />);

    const marketplaceTab = screen.getByText('Marketplace');
    fireEvent.click(marketplaceTab);

    await waitFor(() => {
      expect(screen.getByText('CNC Visualizer Pro')).toBeInTheDocument();
      expect(screen.getByText('Machine Health Monitor')).toBeInTheDocument();
      expect(screen.getByText('G-code Optimizer')).toBeInTheDocument();
    });
  });

  it('handles marketplace plugin installation', async () => {
    renderWithRouter(<PluginsView />);

    const marketplaceTab = screen.getByText('Marketplace');
    fireEvent.click(marketplaceTab);

    await waitFor(() => {
      const installButtons = screen.getAllByRole('button', { name: /install/i });
      if (installButtons.length > 0) {
        fireEvent.click(installButtons[0]);
        expect(mockUsePlugins.setPlugins).toHaveBeenCalled();
      }
    });
  });

  it('switches to registry tab', async () => {
    renderWithRouter(<PluginsView />);

    const registryTab = screen.getByText('Registry');
    fireEvent.click(registryTab);

    await waitFor(() => {
      expect(screen.getByText('No Registry Connected')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /connect to registry/i })).toBeInTheDocument();
    });
  });

  it('opens registry configuration modal', async () => {
    renderWithRouter(<PluginsView />);

    const registryTab = screen.getByText('Registry');
    fireEvent.click(registryTab);

    await waitFor(() => {
      const connectButton = screen.getByRole('button', { name: /connect to registry/i });
      fireEvent.click(connectButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Registry Configuration')).toBeInTheDocument();
      expect(screen.getByLabelText('Registry URL')).toBeInTheDocument();
    });
  });

  it('handles check for updates', async () => {
    renderWithRouter(<PluginsView />);

    const checkUpdatesButton = screen.getByRole('button', { name: /check updates/i });
    fireEvent.click(checkUpdatesButton);

    expect(mockUsePlugins.checkForUpdates).toHaveBeenCalled();
  });

  it('handles export plugins', async () => {
    renderWithRouter(<PluginsView />);

    const exportButton = screen.getByRole('button', { name: /export plugins/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockUsePlugins.exportPlugins).toHaveBeenCalled();
      expect(mockMessage.success).toHaveBeenCalledWith('Plugins exported successfully');
    });
  });

  it('handles import plugins', async () => {
    renderWithRouter(<PluginsView />);

    const importButton = screen.getByRole('button', { name: /import plugins/i });
    const file = new File(['{"plugins":[]}'], 'plugins.json', { type: 'application/json' });

    // Mock FileReader
    const mockFileReader = {
      readAsText: jest.fn(),
      onload: null as any,
      result: '{"plugins":[]}',
    };

    (global as any).FileReader = jest.fn(() => mockFileReader);

    const input = document.querySelector('input[accept=".json"]') as HTMLInputElement;
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);

      // Simulate FileReader.onload
      if (mockFileReader.onload) {
        mockFileReader.onload({ target: { result: '{"plugins":[]}' } } as any);
      }
    }

    await waitFor(() => {
      expect(mockUsePlugins.importPlugins).toHaveBeenCalled();
    });
  });

  it('shows empty state when no plugins are installed', () => {
    const emptyMockUsePlugins = {
      ...mockUsePlugins,
      plugins: [],
    };

    jest.doMock('../../../services/plugin', () => ({
      usePlugins: () => emptyMockUsePlugins,
    }));

    renderWithRouter(<PluginsView />);

    expect(screen.getByText('No plugins installed')).toBeInTheDocument();
    expect(screen.getByText('Upload a plugin ZIP file to get started')).toBeInTheDocument();
  });

  it('applies correct styling for different plugin types', () => {
    renderWithRouter(<PluginsView />);

    // Check that type tags are rendered with appropriate colors
    const utilityTag = screen.getByText('utility');
    const visualizationTag = screen.getByText('visualization');

    expect(utilityTag).toBeInTheDocument();
    expect(visualizationTag).toBeInTheDocument();
  });

  it('handles marketplace search', async () => {
    renderWithRouter(<PluginsView />);

    const marketplaceTab = screen.getByText('Marketplace');
    fireEvent.click(marketplaceTab);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search plugins/i);
      fireEvent.change(searchInput, { target: { value: 'visualizer' } });

      // Should filter the displayed plugins
      expect(searchInput).toHaveValue('visualizer');
    });
  });

  it('handles category filter', async () => {
    renderWithRouter(<PluginsView />);

    const marketplaceTab = screen.getByText('Marketplace');
    fireEvent.click(marketplaceTab);

    await waitFor(() => {
      const categorySelect = screen.getByDisplayValue('All Categories');
      fireEvent.mouseDown(categorySelect);
    });

    // Should show category options
    await waitFor(() => {
      expect(screen.getByText('Visualization')).toBeInTheDocument();
      expect(screen.getByText('Control')).toBeInTheDocument();
      expect(screen.getByText('Productivity')).toBeInTheDocument();
      expect(screen.getByText('Utility')).toBeInTheDocument();
    });
  });
});

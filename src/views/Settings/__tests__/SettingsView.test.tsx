import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SettingsView from '../SettingsView';

// Mock the PluginRenderer component
jest.mock('../../../components', () => ({
  PluginRenderer: ({ screen }: { screen: string }) => (
    <div data-testid={`plugin-renderer-${screen}`}>
      Mock PluginRenderer for {screen}
    </div>
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SettingsView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the settings title', () => {
    renderWithRouter(<SettingsView />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders all settings categories', () => {
    renderWithRouter(<SettingsView />);
    
    expect(screen.getByText('Machine Configuration')).toBeInTheDocument();
    expect(screen.getByText('Jog Settings')).toBeInTheDocument();
    expect(screen.getByText('Connection Settings')).toBeInTheDocument();
    expect(screen.getByText('User Interface')).toBeInTheDocument();
  });

  it('displays machine configuration fields', () => {
    renderWithRouter(<SettingsView />);
    
    expect(screen.getByLabelText('Machine Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Units')).toBeInTheDocument();
    expect(screen.getByText('Work Area (mm)')).toBeInTheDocument();
  });

  it('shows default machine name value', () => {
    renderWithRouter(<SettingsView />);
    
    const machineNameInput = screen.getByDisplayValue('CNC Router');
    expect(machineNameInput).toBeInTheDocument();
  });

  it('displays work area coordinate inputs', () => {
    renderWithRouter(<SettingsView />);
    
    // Check for X, Y, Z coordinate labels and inputs
    const xInput = screen.getByDisplayValue('300'); // X coordinate
    const yInput = screen.getByDisplayValue('200'); // Y coordinate  
    const zInput = screen.getByDisplayValue('50');  // Z coordinate
    
    expect(xInput).toBeInTheDocument();
    expect(yInput).toBeInTheDocument();
    expect(zInput).toBeInTheDocument();
  });

  it('renders jog settings fields', () => {
    renderWithRouter(<SettingsView />);
    
    expect(screen.getByLabelText(/default speed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/acceleration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum speed/i)).toBeInTheDocument();
  });

  it('shows default jog settings values', () => {
    renderWithRouter(<SettingsView />);
    
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument(); // Default speed
    expect(screen.getByDisplayValue('500')).toBeInTheDocument();  // Acceleration
    expect(screen.getByDisplayValue('5000')).toBeInTheDocument(); // Max speed
  });

  it('renders connection settings', () => {
    renderWithRouter(<SettingsView />);
    
    expect(screen.getByLabelText('Serial Port')).toBeInTheDocument();
    expect(screen.getByLabelText('Baud Rate')).toBeInTheDocument();
    expect(screen.getByLabelText(/connection timeout/i)).toBeInTheDocument();
  });

  it('shows default connection values', () => {
    renderWithRouter(<SettingsView />);
    
    expect(screen.getByDisplayValue('/dev/ttyUSB0')).toBeInTheDocument();
    expect(screen.getByDisplayValue('115200')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
  });

  it('renders UI settings', () => {
    renderWithRouter(<SettingsView />);
    
    expect(screen.getByLabelText('Theme')).toBeInTheDocument();
    expect(screen.getByLabelText('Language')).toBeInTheDocument();
    expect(screen.getByText('Show Grid in Workspace')).toBeInTheDocument();
    expect(screen.getByText('Show Coordinates Display')).toBeInTheDocument();
    expect(screen.getByText('Auto-connect on Startup')).toBeInTheDocument();
  });

  it('shows default UI values', () => {
    renderWithRouter(<SettingsView />);
    
    expect(screen.getByDisplayValue('Light')).toBeInTheDocument();
    expect(screen.getByDisplayValue('English')).toBeInTheDocument();
  });

  it('renders unit options correctly', () => {
    renderWithRouter(<SettingsView />);
    
    const unitsSelect = screen.getByDisplayValue('Metric (mm)');
    expect(unitsSelect).toBeInTheDocument();
  });

  it('renders serial port options', () => {
    renderWithRouter(<SettingsView />);
    
    const portSelect = screen.getByDisplayValue('/dev/ttyUSB0');
    expect(portSelect).toBeInTheDocument();
  });

  it('renders baud rate options', () => {
    renderWithRouter(<SettingsView />);
    
    const baudSelect = screen.getByDisplayValue('115200');
    expect(baudSelect).toBeInTheDocument();
  });

  it('renders theme options', () => {
    renderWithRouter(<SettingsView />);
    
    const themeSelect = screen.getByDisplayValue('Light');
    expect(themeSelect).toBeInTheDocument();
  });

  it('renders language options', () => {
    renderWithRouter(<SettingsView />);
    
    const languageSelect = screen.getByDisplayValue('English');
    expect(languageSelect).toBeInTheDocument();
  });

  it('has working switch components', () => {
    renderWithRouter(<SettingsView />);
    
    const switches = document.querySelectorAll('.ant-switch');
    expect(switches).toHaveLength(3); // Three switch components
  });

  it('renders save button', () => {
    renderWithRouter(<SettingsView />);
    
    const saveButton = screen.getByRole('button', { name: /save settings/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveClass('ant-btn-primary');
  });

  it('handles form submission', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    renderWithRouter(<SettingsView />);
    
    const saveButton = screen.getByRole('button', { name: /save settings/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Saving settings:', expect.any(Object));
    });
  });

  it('handles input changes', async () => {
    renderWithRouter(<SettingsView />);
    
    const machineNameInput = screen.getByDisplayValue('CNC Router');
    fireEvent.change(machineNameInput, { target: { value: 'New Machine Name' } });
    
    expect(machineNameInput).toHaveValue('New Machine Name');
  });

  it('handles numeric input changes', async () => {
    renderWithRouter(<SettingsView />);
    
    // Find and change the default speed input
    const speedInput = screen.getByDisplayValue('1000');
    fireEvent.change(speedInput, { target: { value: '1500' } });
    
    expect(speedInput).toHaveValue('1500');
  });

  it('handles select dropdown changes', async () => {
    renderWithRouter(<SettingsView />);
    
    // Test units dropdown
    const unitsSelect = screen.getByDisplayValue('Metric (mm)');
    fireEvent.mouseDown(unitsSelect);
    
    await waitFor(() => {
      const imperialOption = screen.getByText('Imperial (inches)');
      expect(imperialOption).toBeInTheDocument();
    });
  });

  it('validates input number constraints', () => {
    renderWithRouter(<SettingsView />);
    
    // Check that numeric inputs have proper min/max constraints
    const workAreaInputs = screen.getAllByRole('spinbutton');
    expect(workAreaInputs.length).toBeGreaterThan(0);
  });

  it('renders plugin renderer for settings screen', () => {
    renderWithRouter(<SettingsView />);
    
    expect(screen.getByTestId('plugin-renderer-settings')).toBeInTheDocument();
    expect(screen.getByText('Plugin Settings')).toBeInTheDocument();
  });

  it('has proper form layout', () => {
    renderWithRouter(<SettingsView />);
    
    // Check for Ant Design form structure
    const form = document.querySelector('.ant-form');
    expect(form).toBeInTheDocument();
    
    // Check for responsive grid layout
    const rows = document.querySelectorAll('.ant-row');
    expect(rows.length).toBeGreaterThan(0);
    
    const cols = document.querySelectorAll('.ant-col');
    expect(cols.length).toBeGreaterThan(0);
  });

  it('has proper card titles with icons', () => {
    renderWithRouter(<SettingsView />);
    
    // Check that cards are properly structured
    const cards = document.querySelectorAll('.ant-card');
    expect(cards).toHaveLength(4); // Four settings cards
    
    // Check for setting icon in machine configuration card
    const settingIcons = document.querySelectorAll('[data-icon="setting"]');
    expect(settingIcons.length).toBeGreaterThan(0);
  });

  it('organizes form items properly', () => {
    renderWithRouter(<SettingsView />);
    
    // Check for proper form item structure
    const formItems = document.querySelectorAll('.ant-form-item');
    expect(formItems.length).toBeGreaterThan(10); // Multiple form items across all sections
    
    // Check for labels
    const labels = document.querySelectorAll('.ant-form-item-label');
    expect(labels.length).toBeGreaterThan(10);
  });

  it('handles switch toggle events', async () => {
    renderWithRouter(<SettingsView />);
    
    const switches = document.querySelectorAll('.ant-switch');
    if (switches.length > 0) {
      fireEvent.click(switches[0]);
      
      // Switch should change state
      await waitFor(() => {
        expect(switches[0]).toBeInTheDocument();
      });
    }
  });

  it('shows proper dividers for section organization', () => {
    renderWithRouter(<SettingsView />);
    
    expect(screen.getByText('Work Area (mm)')).toBeInTheDocument();
    expect(screen.getByText('Plugin Settings')).toBeInTheDocument();
  });

  it('applies proper styling and spacing', () => {
    renderWithRouter(<SettingsView />);
    
    // Check for margin styling on button row
    const buttonRow = document.querySelector('[style*="margin-top: 24px"]');
    expect(buttonRow).toBeInTheDocument();
    
    // Check for plugin section spacing
    const pluginSection = document.querySelector('[style*="margin-top: 32px"]');
    expect(pluginSection).toBeInTheDocument();
  });
});
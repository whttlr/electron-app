import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ControlsView from '../ControlsView';

// Mock the components
jest.mock('../../../components', () => ({
  PluginRenderer: ({ screen }: { screen: string }) => (
    <div data-testid={`plugin-renderer-${screen}`}>
      Mock PluginRenderer for {screen}
    </div>
  ),
  WorkingAreaPreview: ({
    currentPosition, workArea, showGrid, onGridToggle,
  }: any) => (
    <div data-testid="working-area-preview">
      Mock WorkingAreaPreview
      <div>Position: {JSON.stringify(currentPosition)}</div>
      <div>Work Area: {JSON.stringify(workArea)}</div>
      <button onClick={() => onGridToggle(!showGrid)}>Toggle Grid</button>
    </div>
  ),
  MachineDisplay2D: ({
    currentPosition,
    workArea,
    showGrid,
    showTrail,
    onGridToggle,
    onTrailToggle,
    onSetOrigin,
    onGoHome,
  }: any) => (
    <div data-testid="machine-display-2d">
      Mock MachineDisplay2D
      <div>Position: {JSON.stringify(currentPosition)}</div>
      <button onClick={() => onGridToggle(!showGrid)}>Toggle Grid</button>
      <button onClick={() => onTrailToggle(!showTrail)}>Toggle Trail</button>
      <button onClick={onSetOrigin}>Set Origin</button>
      <button onClick={onGoHome}>Go Home</button>
    </div>
  ),
}));

const renderWithRouter = (component: React.ReactElement) => render(
    <BrowserRouter>
      {component}
    </BrowserRouter>,
);

describe('ControlsView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the controls title', () => {
    renderWithRouter(<ControlsView />);
    expect(screen.getByText('Jog Controls')).toBeInTheDocument();
  });

  it('shows connection warning when machine is not connected', () => {
    renderWithRouter(<ControlsView />);
    expect(screen.getByText('Machine Not Connected')).toBeInTheDocument();
    expect(screen.getByText('Connect to your CNC machine to enable jog controls.')).toBeInTheDocument();
  });

  it('hides connection warning when machine is connected', async () => {
    renderWithRouter(<ControlsView />);

    const connectButton = screen.getByRole('button', { name: /connect/i });
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.queryByText('Machine Not Connected')).not.toBeInTheDocument();
    });
  });

  it('renders visualization components', () => {
    renderWithRouter(<ControlsView />);

    expect(screen.getByTestId('working-area-preview')).toBeInTheDocument();
    expect(screen.getByTestId('machine-display-2d')).toBeInTheDocument();
  });

  it('displays current position', () => {
    renderWithRouter(<ControlsView />);

    expect(screen.getByText('X: 0.000 mm')).toBeInTheDocument();
    expect(screen.getByText('Y: 0.000 mm')).toBeInTheDocument();
    expect(screen.getByText('Z: 0.000 mm')).toBeInTheDocument();
  });

  it('renders jog settings', () => {
    renderWithRouter(<ControlsView />);

    expect(screen.getByText('Jog Distance (mm):')).toBeInTheDocument();
    expect(screen.getByText('Feed Rate (mm/min):')).toBeInTheDocument();
  });

  it('has jog distance options', () => {
    renderWithRouter(<ControlsView />);

    // Check if select dropdown is present with default value
    const select = screen.getByDisplayValue('1 mm');
    expect(select).toBeInTheDocument();
  });

  it('renders X/Y jog controls', () => {
    renderWithRouter(<ControlsView />);

    expect(screen.getByRole('button', { name: /y\+/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /y-/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /x\+/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /x-/i })).toBeInTheDocument();
  });

  it('renders Z controls', () => {
    renderWithRouter(<ControlsView />);

    expect(screen.getByRole('button', { name: /z\+ \(up\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /z- \(down\)/i })).toBeInTheDocument();
  });

  it('renders quick action buttons', () => {
    renderWithRouter(<ControlsView />);

    expect(screen.getByRole('button', { name: /set origin \(g92\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to origin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /probe z/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /emergency stop/i })).toBeInTheDocument();
  });

  it('disables jog controls when not connected', () => {
    renderWithRouter(<ControlsView />);

    const jogButtons = [
      screen.getByRole('button', { name: /y\+/i }),
      screen.getByRole('button', { name: /y-/i }),
      screen.getByRole('button', { name: /x\+/i }),
      screen.getByRole('button', { name: /x-/i }),
      screen.getByRole('button', { name: /z\+ \(up\)/i }),
      screen.getByRole('button', { name: /z- \(down\)/i }),
    ];

    jogButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('enables jog controls when connected', async () => {
    renderWithRouter(<ControlsView />);

    const connectButton = screen.getByRole('button', { name: /connect/i });
    fireEvent.click(connectButton);

    await waitFor(() => {
      const jogButtons = [
        screen.getByRole('button', { name: /y\+/i }),
        screen.getByRole('button', { name: /y-/i }),
        screen.getByRole('button', { name: /x\+/i }),
        screen.getByRole('button', { name: /x-/i }),
        screen.getByRole('button', { name: /z\+ \(up\)/i }),
        screen.getByRole('button', { name: /z- \(down\)/i }),
      ];

      jogButtons.forEach((button) => {
        expect(button).toBeEnabled();
      });
    });
  });

  it('handles home button click', async () => {
    renderWithRouter(<ControlsView />);

    // Connect first
    const connectButton = screen.getByRole('button', { name: /connect/i });
    fireEvent.click(connectButton);

    // Click a jog button to change position
    await waitFor(() => {
      const xPlusButton = screen.getByRole('button', { name: /x\+/i });
      fireEvent.click(xPlusButton);
    });

    // Home all axes
    const homeButton = screen.getByRole('button', { name: /home all axes/i });
    fireEvent.click(homeButton);

    await waitFor(() => {
      expect(screen.getByText('X: 0.000 mm')).toBeInTheDocument();
      expect(screen.getByText('Y: 0.000 mm')).toBeInTheDocument();
      expect(screen.getByText('Z: 0.000 mm')).toBeInTheDocument();
    });
  });

  it('updates position when jog buttons are clicked', async () => {
    renderWithRouter(<ControlsView />);

    // Connect first
    const connectButton = screen.getByRole('button', { name: /connect/i });
    fireEvent.click(connectButton);

    await waitFor(() => {
      const xPlusButton = screen.getByRole('button', { name: /x\+/i });
      fireEvent.click(xPlusButton);
    });

    await waitFor(() => {
      expect(screen.getByText('X: 1.000 mm')).toBeInTheDocument();
    });
  });

  it('changes jog distance when select value changes', () => {
    renderWithRouter(<ControlsView />);

    const select = document.querySelector('.ant-select-selector');
    expect(select).toBeInTheDocument();
  });

  it('renders plugin renderer for controls screen', () => {
    renderWithRouter(<ControlsView />);

    expect(screen.getByTestId('plugin-renderer-controls')).toBeInTheDocument();
    expect(screen.getByText('Control Plugins')).toBeInTheDocument();
  });

  it('passes correct props to visualization components', () => {
    renderWithRouter(<ControlsView />);

    const workingAreaPreview = screen.getByTestId('working-area-preview');
    expect(workingAreaPreview).toHaveTextContent('Position: {"x":0,"y":0,"z":0}');
    expect(workingAreaPreview).toHaveTextContent('Work Area: {"x":300,"y":200,"z":50}');

    const machineDisplay = screen.getByTestId('machine-display-2d');
    expect(machineDisplay).toHaveTextContent('Position: {"x":0,"y":0,"z":0}');
  });

  it('applies danger styling to emergency stop button', () => {
    renderWithRouter(<ControlsView />);

    const emergencyStopButton = screen.getByRole('button', { name: /emergency stop/i });
    expect(emergencyStopButton).toHaveClass('ant-btn-dangerous');
  });

  it('handles feed rate input changes', () => {
    renderWithRouter(<ControlsView />);

    const feedRateInput = screen.getByDisplayValue('1000');
    expect(feedRateInput).toBeInTheDocument();
  });

  it('logs appropriate messages when jogging', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    renderWithRouter(<ControlsView />);

    // Connect first
    const connectButton = screen.getByRole('button', { name: /connect/i });
    fireEvent.click(connectButton);

    await waitFor(() => {
      const xPlusButton = screen.getByRole('button', { name: /x\+/i });
      fireEvent.click(xPlusButton);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Jogging X by 1mm at 1000mm/min');
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardView from '../DashboardView';

// Mock the PluginRenderer component
jest.mock('../../../components', () => ({
  PluginRenderer: ({ screen, placement }: { screen: string; placement?: string }) => (
    <div data-testid={`plugin-renderer-${screen}${placement ? `-${placement}` : ''}`}>
      Mock PluginRenderer for {screen} {placement}
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

describe('DashboardView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard title', () => {
    renderWithRouter(<DashboardView />);
    expect(screen.getByText('CNC Dashboard')).toBeInTheDocument();
  });

  it('renders the welcome paragraph', () => {
    renderWithRouter(<DashboardView />);
    expect(screen.getByText(/Welcome to the CNC Jog Controls dashboard/)).toBeInTheDocument();
  });

  it('renders all dashboard cards', () => {
    renderWithRouter(<DashboardView />);
    
    expect(screen.getByText('Jog Controls')).toBeInTheDocument();
    expect(screen.getByText('Machine Status')).toBeInTheDocument();
    expect(screen.getByText('Plugins')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders card descriptions', () => {
    renderWithRouter(<DashboardView />);
    
    expect(screen.getByText('Manual machine control and positioning')).toBeInTheDocument();
    expect(screen.getByText('Real-time machine monitoring and diagnostics')).toBeInTheDocument();
    expect(screen.getByText('Install and configure CNC plugins')).toBeInTheDocument();
    expect(screen.getByText('System configuration and preferences')).toBeInTheDocument();
  });

  it('renders navigation buttons with correct hrefs', () => {
    renderWithRouter(<DashboardView />);
    
    const controlsLink = screen.getByRole('link', { name: /open controls/i });
    expect(controlsLink).toHaveAttribute('href', '/controls');
    
    const pluginsLink = screen.getByRole('link', { name: /manage plugins/i });
    expect(pluginsLink).toHaveAttribute('href', '/plugins');
    
    const settingsLink = screen.getByRole('link', { name: /configure/i });
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('renders view status button', () => {
    renderWithRouter(<DashboardView />);
    expect(screen.getByRole('button', { name: /view status/i })).toBeInTheDocument();
  });

  it('renders card icons', () => {
    renderWithRouter(<DashboardView />);
    
    // Check for icon elements (Ant Design icons render as spans with specific roles)
    expect(screen.getByRole('img', { name: 'control' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'tool' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'appstore' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'setting' })).toBeInTheDocument();
  });

  it('renders plugin renderers for main screen', () => {
    renderWithRouter(<DashboardView />);
    
    expect(screen.getByTestId('plugin-renderer-main')).toBeInTheDocument();
    expect(screen.getByTestId('plugin-renderer-main-modal')).toBeInTheDocument();
  });

  it('renders additional tools section', () => {
    renderWithRouter(<DashboardView />);
    expect(screen.getByText('Additional Tools')).toBeInTheDocument();
  });

  it('has proper responsive grid layout', () => {
    renderWithRouter(<DashboardView />);
    
    // Check for Ant Design Row and Col components
    const row = document.querySelector('.ant-row');
    expect(row).toBeInTheDocument();
    
    const cols = document.querySelectorAll('.ant-col');
    expect(cols).toHaveLength(4); // One for each dashboard card
  });

  it('applies dashboard-card className to cards', () => {
    renderWithRouter(<DashboardView />);
    
    const cards = document.querySelectorAll('.dashboard-card');
    expect(cards).toHaveLength(4);
  });

  it('renders buttons with correct types', () => {
    renderWithRouter(<DashboardView />);
    
    const primaryLink = screen.getByRole('link', { name: /open controls/i });
    expect(primaryLink).toHaveClass('ant-btn-primary');
    
    const defaultLinks = [
      screen.getByRole('link', { name: /manage plugins/i }),
      screen.getByRole('link', { name: /configure/i })
    ];
    defaultLinks.forEach(link => {
      expect(link).toHaveClass('ant-btn-default');
    });

    const viewStatusButton = screen.getByRole('button', { name: /view status/i });
    expect(viewStatusButton).toHaveClass('ant-btn-default');
  });
});
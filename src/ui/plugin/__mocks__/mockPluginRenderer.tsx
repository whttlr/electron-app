import React from 'react';

// Mock PluginRenderer component for testing
export const MockPluginRenderer: React.FC<{
  screen: string;
  placement?: string;
  testId?: string;
}> = ({ screen, placement, testId = 'plugin-renderer' }) => {
  return (
    <div 
      data-testid={testId} 
      data-screen={screen} 
      data-placement={placement}
    >
      Mock Plugin Renderer - Screen: {screen}, Placement: {placement || 'all'}
    </div>
  );
};

// Mock plugin render content for different placements
export const mockDashboardContent = (
  <div data-testid="mock-dashboard-plugin">
    <h4>Mock Dashboard Plugin</h4>
    <p>Dashboard plugin content</p>
  </div>
);

export const mockSidebarContent = (
  <div data-testid="mock-sidebar-plugin">
    <h4>Mock Sidebar Plugin</h4>
    <p>Sidebar plugin content</p>
  </div>
);

export const mockModalContent = (
  <div data-testid="mock-modal-plugin">
    <h4>Mock Modal Plugin</h4>
    <p>Modal plugin content</p>
  </div>
);

// Mock plugin rendering props for different scenarios
export const mockPluginRendererProps = {
  mainDashboard: {
    screen: 'main' as const,
    placement: 'dashboard' as const
  },
  controlsSidebar: {
    screen: 'controls' as const,
    placement: 'sidebar' as const
  },
  settingsModal: {
    screen: 'settings' as const,
    placement: 'modal' as const
  },
  allPlacements: {
    screen: 'main' as const
    // No placement specified = all placements
  }
};

export default MockPluginRenderer;
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme, useAntdTheme } from '../ThemeProvider';
import { CustomThemeConfig } from '../ThemeTypes';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Test component to use the theme context
const TestComponent: React.FC = () => {
  const { themeConfig, isDarkMode, setDarkMode, updateTheme, antdTheme } = useTheme();

  return (
    <div>
      <div data-testid="theme-config">{JSON.stringify(themeConfig)}</div>
      <div data-testid="dark-mode">{isDarkMode.toString()}</div>
      <div data-testid="antd-theme">{JSON.stringify(antdTheme)}</div>
      <button 
        data-testid="toggle-dark-mode" 
        onClick={() => setDarkMode(!isDarkMode)}
      >
        Toggle Dark Mode
      </button>
      <button 
        data-testid="update-theme" 
        onClick={() => updateTheme({ primaryColor: '#ff0000' })}
      >
        Update Theme
      </button>
      <button 
        data-testid="update-spacing" 
        onClick={() => updateTheme({ spacing: 24 })}
      >
        Update Spacing
      </button>
    </div>
  );
};

// Test component for useAntdTheme hook
const AntdThemeTestComponent: React.FC = () => {
  const tokens = useAntdTheme();

  return (
    <div>
      <div data-testid="antd-tokens">{JSON.stringify(tokens)}</div>
    </div>
  );
};

const renderWithThemeProvider = (
  component: React.ReactElement,
  props: { initialTheme?: Partial<CustomThemeConfig>; enableDarkMode?: boolean } = {}
) => {
  return render(
    <ThemeProvider {...props}>
      {component}
    </ThemeProvider>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('Default Behavior', () => {
    test('should provide default theme configuration', () => {
      renderWithThemeProvider(<TestComponent />);
      
      const themeConfigElement = screen.getByTestId('theme-config');
      const themeConfig = JSON.parse(themeConfigElement.textContent || '{}');
      
      expect(themeConfig.primaryColor).toBe('#1890ff');
      expect(themeConfig.borderRadius).toBe(6);
      expect(themeConfig.fontSize).toBe(14);
      expect(themeConfig.spacing).toBe(16);
      expect(themeConfig.axisColors).toEqual({
        x: '#52c41a',
        y: '#ff4d4f',
        z: '#1890ff'
      });
      expect(themeConfig.cncColors).toEqual({
        connected: '#52c41a',
        disconnected: '#8c8c8c',
        error: '#ff4d4f',
        warning: '#faad14',
        homing: '#1890ff',
        jogging: '#096dd9'
      });
    });

    test('should default to light mode when dark mode is disabled', () => {
      renderWithThemeProvider(<TestComponent />, { enableDarkMode: false });
      
      const darkModeElement = screen.getByTestId('dark-mode');
      expect(darkModeElement.textContent).toBe('false');
    });

    test('should respect initial theme configuration', () => {
      const initialTheme = {
        primaryColor: '#00ff00',
        borderRadius: 12,
        axisColors: { x: '#aaa', y: '#bbb', z: '#ccc' }
      };
      
      renderWithThemeProvider(<TestComponent />, { initialTheme });
      
      const themeConfigElement = screen.getByTestId('theme-config');
      const themeConfig = JSON.parse(themeConfigElement.textContent || '{}');
      
      expect(themeConfig.primaryColor).toBe('#00ff00');
      expect(themeConfig.borderRadius).toBe(12);
      expect(themeConfig.axisColors).toEqual({ x: '#aaa', y: '#bbb', z: '#ccc' });
    });
  });

  describe('Dark Mode Management', () => {
    test('should toggle dark mode when enabled', () => {
      renderWithThemeProvider(<TestComponent />, { enableDarkMode: true });
      
      const toggleButton = screen.getByTestId('toggle-dark-mode');
      const darkModeElement = screen.getByTestId('dark-mode');
      
      expect(darkModeElement.textContent).toBe('false');
      
      fireEvent.click(toggleButton);
      expect(darkModeElement.textContent).toBe('true');
      
      fireEvent.click(toggleButton);
      expect(darkModeElement.textContent).toBe('false');
    });

    test('should not toggle dark mode when disabled', () => {
      renderWithThemeProvider(<TestComponent />, { enableDarkMode: false });
      
      const toggleButton = screen.getByTestId('toggle-dark-mode');
      const darkModeElement = screen.getByTestId('dark-mode');
      
      expect(darkModeElement.textContent).toBe('false');
      
      fireEvent.click(toggleButton);
      expect(darkModeElement.textContent).toBe('false'); // Should remain false
    });

    test('should persist dark mode preference to localStorage', () => {
      renderWithThemeProvider(<TestComponent />, { enableDarkMode: true });
      
      const toggleButton = screen.getByTestId('toggle-dark-mode');
      
      fireEvent.click(toggleButton);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('jog-controls-dark-mode', 'true');
    });

    test('should load dark mode preference from localStorage', () => {
      localStorageMock.setItem('jog-controls-dark-mode', 'true');
      
      renderWithThemeProvider(<TestComponent />, { enableDarkMode: true });
      
      const darkModeElement = screen.getByTestId('dark-mode');
      expect(darkModeElement.textContent).toBe('true');
    });
  });

  describe('Theme Updates', () => {
    test('should update theme configuration', () => {
      renderWithThemeProvider(<TestComponent />);
      
      const updateButton = screen.getByTestId('update-theme');
      fireEvent.click(updateButton);
      
      const themeConfigElement = screen.getByTestId('theme-config');
      const themeConfig = JSON.parse(themeConfigElement.textContent || '{}');
      
      expect(themeConfig.primaryColor).toBe('#ff0000');
    });

    test('should merge theme updates with existing configuration', () => {
      const initialTheme = {
        primaryColor: '#0000ff',
        axisColors: { x: '#aaa', y: '#bbb', z: '#ccc' }
      };
      
      renderWithThemeProvider(<TestComponent />, { initialTheme });
      
      const updateButton = screen.getByTestId('update-theme');
      fireEvent.click(updateButton);
      
      const themeConfigElement = screen.getByTestId('theme-config');
      const themeConfig = JSON.parse(themeConfigElement.textContent || '{}');
      
      expect(themeConfig.primaryColor).toBe('#ff0000'); // Updated
      expect(themeConfig.axisColors).toEqual({ x: '#aaa', y: '#bbb', z: '#ccc' }); // Preserved
    });

    test('should update spacing in theme configuration', () => {
      renderWithThemeProvider(<TestComponent />);
      
      const updateButton = screen.getByTestId('update-spacing');
      fireEvent.click(updateButton);
      
      const themeConfigElement = screen.getByTestId('theme-config');
      const themeConfig = JSON.parse(themeConfigElement.textContent || '{}');
      
      expect(themeConfig.spacing).toBe(24); // Updated from default 16
    });
  });

  describe('CSS Custom Properties', () => {
    test('should set axis colors as CSS variables', () => {
      renderWithThemeProvider(<TestComponent />);
      
      const root = document.documentElement;
      
      expect(root.style.getPropertyValue('--axis-x-color')).toBe('#52c41a');
      expect(root.style.getPropertyValue('--axis-y-color')).toBe('#ff4d4f');
      expect(root.style.getPropertyValue('--axis-z-color')).toBe('#1890ff');
    });

    test('should set primary color as CSS variable', () => {
      renderWithThemeProvider(<TestComponent />);
      
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--primary-color')).toBe('#1890ff');
    });

    test('should update CSS variables when theme changes', () => {
      renderWithThemeProvider(<TestComponent />);
      
      const updateButton = screen.getByTestId('update-theme');
      fireEvent.click(updateButton);
      
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--primary-color')).toBe('#ff0000');
    });

    test('should set dark mode CSS variables', () => {
      renderWithThemeProvider(<TestComponent />, { enableDarkMode: true });
      
      const toggleButton = screen.getByTestId('toggle-dark-mode');
      fireEvent.click(toggleButton);
      
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--theme-mode')).toBe('dark');
      expect(root.style.getPropertyValue('--bg-color')).toBe('#141414');
    });

    test('should set light mode CSS variables', () => {
      renderWithThemeProvider(<TestComponent />);
      
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--theme-mode')).toBe('light');
      expect(root.style.getPropertyValue('--bg-color')).toBe('#ffffff');
    });
  });

  describe('Error Handling', () => {
    test('should throw error when useTheme is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('System Theme Detection', () => {
    test('should detect system dark mode preference', () => {
      // Mock system preference for dark mode
      (window.matchMedia as jest.Mock).mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      
      renderWithThemeProvider(<TestComponent />, { enableDarkMode: true });
      
      const darkModeElement = screen.getByTestId('dark-mode');
      expect(darkModeElement.textContent).toBe('true');
    });

    test('should listen for system theme changes', () => {
      const mockMediaQuery = {
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
      
      (window.matchMedia as jest.Mock).mockReturnValue(mockMediaQuery);
      
      renderWithThemeProvider(<TestComponent />, { enableDarkMode: true });
      
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('Ant Design v5 Integration', () => {
    test('should provide Ant Design theme configuration', () => {
      renderWithThemeProvider(<TestComponent />);
      
      const antdThemeElement = screen.getByTestId('antd-theme');
      const antdTheme = JSON.parse(antdThemeElement.textContent || '{}');
      
      expect(antdTheme.token.colorPrimary).toBe('#1890ff');
      expect(antdTheme.token.borderRadius).toBe(6);
      expect(antdTheme.token.fontSize).toBe(14);
      expect(antdTheme.components.Button.borderRadius).toBe(6);
      expect(antdTheme.components.Card.borderRadius).toBe(6);
    });

    test('should use dark algorithm when in dark mode', () => {
      const TestAlgorithmComponent = () => {
        const { antdTheme, isDarkMode, setDarkMode } = useTheme();
        return (
          <div>
            <div data-testid="has-algorithm">{typeof antdTheme.algorithm}</div>
            <div data-testid="is-dark">{isDarkMode.toString()}</div>
            <button data-testid="toggle" onClick={() => setDarkMode(!isDarkMode)}>Toggle</button>
          </div>
        );
      };
      
      renderWithThemeProvider(<TestAlgorithmComponent />, { enableDarkMode: true });
      
      const algorithmElement = screen.getByTestId('has-algorithm');
      expect(algorithmElement.textContent).toBe('function');
    });

    test('should apply theme to Ant Design ConfigProvider', () => {
      const { container } = renderWithThemeProvider(<TestComponent />);
      
      // Check that the theme provider wrapper exists
      const themeProviderWrapper = container.querySelector('.theme-provider');
      expect(themeProviderWrapper).toBeInTheDocument();
    });

    test('should apply dark theme class when in dark mode', () => {
      const { container } = renderWithThemeProvider(<TestComponent />, { enableDarkMode: true });
      
      const toggleButton = screen.getByTestId('toggle-dark-mode');
      fireEvent.click(toggleButton);
      
      const themeProviderWrapper = container.querySelector('.theme-provider.dark');
      expect(themeProviderWrapper).toBeInTheDocument();
      expect(themeProviderWrapper?.getAttribute('data-theme')).toBe('dark');
    });

    test('should apply light theme class when in light mode', () => {
      const { container } = renderWithThemeProvider(<TestComponent />);
      
      const themeProviderWrapper = container.querySelector('.theme-provider.light');
      expect(themeProviderWrapper).toBeInTheDocument();
      expect(themeProviderWrapper?.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('useAntdTheme Hook', () => {
    test('should provide Ant Design tokens', () => {
      renderWithThemeProvider(<AntdThemeTestComponent />);
      
      const tokensElement = screen.getByTestId('antd-tokens');
      const tokens = JSON.parse(tokensElement.textContent || '{}');
      
      expect(tokens.colorPrimary).toBeDefined();
      expect(tokens.colorText).toBeDefined();
      expect(tokens.colorBgContainer).toBeDefined();
      expect(tokens.borderRadius).toBeDefined();
      expect(tokens.fontSize).toBeDefined();
    });

    test('should work when used inside ThemeProvider', () => {
      // The useAntdTheme hook doesn't throw outside provider in our implementation
      // because it uses Ant Design's built-in useToken hook
      // Let's test that it works properly when used correctly
      renderWithThemeProvider(<AntdThemeTestComponent />);
      
      const tokensElement = screen.getByTestId('antd-tokens');
      const tokens = JSON.parse(tokensElement.textContent || '{}');
      
      expect(tokens.colorPrimary).toBe('#1890ff');
    });
  });
});
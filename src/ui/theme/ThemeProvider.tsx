import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import type { ThemeConfig as AntdThemeConfig } from 'antd';
import { CustomThemeConfig, ThemeContextType } from './ThemeTypes';
import { logger } from '../../services/logger';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultThemeConfig: CustomThemeConfig = {
  primaryColor: '#1890ff',
  borderRadius: 6,
  fontSize: 14,
  spacing: 16,
  axisColors: {
    x: '#52c41a', // Green for X
    y: '#ff4d4f', // Red for Y  
    z: '#1890ff'  // Blue for Z
  },
  cncColors: {
    connected: '#52c41a',
    disconnected: '#8c8c8c',
    error: '#ff4d4f',
    warning: '#faad14',
    homing: '#1890ff',
    jogging: '#096dd9'
  }
};

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Partial<CustomThemeConfig>;
  enableDarkMode?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = {},
  enableDarkMode = true
}) => {
  const [themeConfig, setThemeConfig] = useState<CustomThemeConfig>({
    ...defaultThemeConfig,
    ...initialTheme
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (!enableDarkMode) return false;
    
    // Check localStorage first
    const stored = localStorage.getItem('jog-controls-dark-mode');
    if (stored !== null) {
      return stored === 'true';
    }
    
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen for system theme changes
  useEffect(() => {
    if (!enableDarkMode) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly set a preference
      const stored = localStorage.getItem('jog-controls-dark-mode');
      if (stored === null) {
        setIsDarkMode(e.matches);
        logger.debug('System dark mode changed', { darkMode: e.matches });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableDarkMode]);

  // Persist dark mode preference
  useEffect(() => {
    if (enableDarkMode) {
      localStorage.setItem('jog-controls-dark-mode', isDarkMode.toString());
      logger.debug('Dark mode preference saved', { darkMode: isDarkMode });
    }
  }, [isDarkMode, enableDarkMode]);

  const setDarkMode = (dark: boolean) => {
    if (!enableDarkMode) {
      logger.warn('Dark mode is disabled');
      return;
    }
    setIsDarkMode(dark);
  };

  const updateTheme = (config: Partial<CustomThemeConfig>) => {
    setThemeConfig(prev => {
      const newConfig = { ...prev, ...config };
      logger.debug('Theme configuration updated', { config: newConfig });
      return newConfig;
    });
  };

  // Generate Ant Design v5 theme configuration
  const antdTheme: AntdThemeConfig = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      // Seed tokens (most important)
      colorPrimary: themeConfig.primaryColor,
      borderRadius: themeConfig.borderRadius,
      fontSize: themeConfig.fontSize,
      
      // Layout tokens
      padding: themeConfig.spacing,
      margin: themeConfig.spacing,
      
      // Visual tokens
      wireframe: false,
      motionDurationSlow: '0.3s',
      motionDurationMid: '0.2s',
      motionDurationFast: '0.1s',
      
      // Typography tokens
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      lineHeight: 1.5,
      
      // Border tokens
      lineWidth: 1,
      
      // Box shadow tokens
      boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    },
    components: {
      Button: {
        borderRadius: themeConfig.borderRadius,
        controlHeight: 36,
        paddingInline: 16,
        fontWeight: 500,
      },
      Card: {
        borderRadius: themeConfig.borderRadius,
        headerBg: isDarkMode ? '#1f1f1f' : '#fafafa',
        actionsBg: isDarkMode ? '#141414' : '#f5f5f5',
        paddingLG: themeConfig.spacing * 1.5,
      },
      Input: {
        borderRadius: themeConfig.borderRadius,
        controlHeight: 36,
        paddingInline: 12,
      },
      InputNumber: {
        borderRadius: themeConfig.borderRadius,
        controlHeight: 36,
        paddingInline: 12,
      },
      Select: {
        borderRadius: themeConfig.borderRadius,
        controlHeight: 36,
      },
      Slider: {
        handleColor: themeConfig.primaryColor,
        trackBg: themeConfig.primaryColor,
        handleSize: 14,
        railSize: 4,
        trackSize: 4,
      },
      Switch: {
        borderRadius: themeConfig.borderRadius * 3,
      },
      Tabs: {
        borderRadius: themeConfig.borderRadius,
        horizontalMargin: `0 0 ${themeConfig.spacing}px 0`,
      },
      Space: {
        size: themeConfig.spacing,
      },
      Divider: {
        marginLG: themeConfig.spacing,
      },
      Typography: {
        titleMarginBottom: themeConfig.spacing * 0.75,
        titleMarginTop: themeConfig.spacing * 0.75,
      },
    },
  };

  // Set CSS custom properties for non-Ant components and advanced styling
  useEffect(() => {
    const root = document.documentElement;
    
    // Theme configuration
    root.style.setProperty('--primary-color', themeConfig.primaryColor);
    root.style.setProperty('--border-radius', `${themeConfig.borderRadius}px`);
    root.style.setProperty('--font-size', `${themeConfig.fontSize}px`);
    root.style.setProperty('--spacing', `${themeConfig.spacing}px`);
    
    // Axis colors
    root.style.setProperty('--axis-x-color', themeConfig.axisColors.x);
    root.style.setProperty('--axis-y-color', themeConfig.axisColors.y);
    root.style.setProperty('--axis-z-color', themeConfig.axisColors.z);
    
    // CNC status colors
    root.style.setProperty('--cnc-connected-color', themeConfig.cncColors.connected);
    root.style.setProperty('--cnc-disconnected-color', themeConfig.cncColors.disconnected);
    root.style.setProperty('--cnc-error-color', themeConfig.cncColors.error);
    root.style.setProperty('--cnc-warning-color', themeConfig.cncColors.warning);
    root.style.setProperty('--cnc-homing-color', themeConfig.cncColors.homing);
    root.style.setProperty('--cnc-jogging-color', themeConfig.cncColors.jogging);
    
    // Theme mode specific colors
    if (isDarkMode) {
      root.style.setProperty('--bg-color', '#141414');
      root.style.setProperty('--surface-color', '#1f1f1f');
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--text-secondary', '#b3b3b3');
      root.style.setProperty('--border-color', '#424242');
      root.style.setProperty('--hover-bg', '#262626');
      root.style.setProperty('--active-bg', '#303030');
    } else {
      root.style.setProperty('--bg-color', '#ffffff');
      root.style.setProperty('--surface-color', '#fafafa');
      root.style.setProperty('--text-color', '#000000');
      root.style.setProperty('--text-secondary', '#666666');
      root.style.setProperty('--border-color', '#d9d9d9');
      root.style.setProperty('--hover-bg', '#f5f5f5');
      root.style.setProperty('--active-bg', '#e6f7ff');
    }

    // Set theme mode
    root.style.setProperty('--theme-mode', isDarkMode ? 'dark' : 'light');
    
    // Add data attribute for CSS selectors
    root.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');

    logger.debug('CSS custom properties updated', { 
      isDarkMode, 
      primaryColor: themeConfig.primaryColor,
      borderRadius: themeConfig.borderRadius 
    });
  }, [themeConfig, isDarkMode]);

  const contextValue: ThemeContextType = {
    themeConfig,
    isDarkMode,
    setDarkMode,
    updateTheme,
    antdTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={antdTheme}>
        <div 
          className={`theme-provider ${isDarkMode ? 'dark' : 'light'}`}
          data-theme={isDarkMode ? 'dark' : 'light'}
        >
          {children}
        </div>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook to access Ant Design theme tokens directly
export const useAntdTheme = () => {
  const { token } = theme.useToken();
  return token;
};
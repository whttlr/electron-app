import React, {
  createContext, useContext, useState, useEffect, ReactNode,
} from 'react';
import { settingsService, AppSettings } from '../services/settings';

interface SettingsContextType {
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  reloadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedSettings = await settingsService.getAllSettings();
      setSettings(loadedSettings);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      await settingsService.saveSettings(newSettings);

      // Update local state
      setSettings((current) => (current ? { ...current, ...newSettings } : null));
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  const reloadSettings = async () => {
    await loadSettings();
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Apply theme to document when settings change
  useEffect(() => {
    if (settings?.ui?.theme) {
      document.body.setAttribute('data-theme', settings.ui.theme);

      // Update antd theme by adding/removing CSS class
      if (settings.ui.theme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  }, [settings?.ui?.theme]);

  const value: SettingsContextType = {
    settings,
    isLoading,
    error,
    updateSettings,
    reloadSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

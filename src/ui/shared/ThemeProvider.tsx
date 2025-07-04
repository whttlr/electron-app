import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

// Theme toggle component
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from './Button';
import { cn } from './utils';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// Theme configuration
export const themes = {
  light: {
    name: 'Light',
    class: '',
    description: 'Clean and bright interface for well-lit environments',
  },
  dark: {
    name: 'Dark',
    class: 'dark',
    description: 'Easy on the eyes for low-light conditions',
  },
  industrial: {
    name: 'Industrial',
    class: 'industrial',
    description: 'High contrast theme optimized for workshop environments',
  },
} as const;

export type Theme = keyof typeof themes

// Custom hook for theme management
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  systemTheme: Theme
  themes: typeof themes
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export interface CustomThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  storageKey = 'cnc-theme',
}) => {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = React.useState<Theme>('light');

  // Load theme from localStorage
  React.useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme;
    if (savedTheme && savedTheme in themes) {
      setThemeState(savedTheme);
    }

    // Detect system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [storageKey]);

  // Apply theme class to document
  React.useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    Object.values(themes).forEach((t) => {
      if (t.class) root.classList.remove(t.class);
    });

    // Add current theme class
    if (themes[theme].class) {
      root.classList.add(themes[theme].class);
    }

    // Update CSS variables for industrial theme
    if (theme === 'industrial') {
      root.style.setProperty('--background', '220 13% 10%');
      root.style.setProperty('--foreground', '0 0% 98%');
      root.style.setProperty('--card', '220 13% 13%');
      root.style.setProperty('--card-foreground', '0 0% 98%');
      root.style.setProperty('--primary', '38 92% 50%');
      root.style.setProperty('--primary-foreground', '0 0% 10%');
      root.style.setProperty('--muted', '220 13% 20%');
      root.style.setProperty('--muted-foreground', '0 0% 70%');
    } else {
      // Reset to default values
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--card');
      root.style.removeProperty('--card-foreground');
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--muted');
      root.style.removeProperty('--muted-foreground');
    }
  }, [theme]);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  }, [storageKey]);

  const value: ThemeContextValue = {
    theme,
    setTheme,
    systemTheme,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export interface ThemeToggleProps {
  variant?: 'icon' | 'menu' | 'dropdown'
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  className,
}) => {
  const { theme, setTheme, themes } = useTheme();

  if (variant === 'icon') {
    const icons = {
      light: Sun,
      dark: Moon,
      industrial: Monitor,
    };

    const Icon = icons[theme];

    const cycleTheme = () => {
      const themeKeys = Object.keys(themes) as Theme[];
      const currentIndex = themeKeys.indexOf(theme);
      const nextIndex = (currentIndex + 1) % themeKeys.length;
      setTheme(themeKeys[nextIndex]);
    };

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={cycleTheme}
        className={cn('relative', className)}
      >
        <Icon className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  if (variant === 'menu') {
    return (
      <div className={cn('space-y-1', className)}>
        {(Object.entries(themes) as [Theme, typeof themes[Theme]][]).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setTheme(key)}
            className={cn(
              'w-full text-left px-4 py-2 rounded-md text-sm transition-colors',
              theme === key
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted',
            )}
          >
            <div className="font-medium">{config.name}</div>
            <div className="text-xs opacity-70">{config.description}</div>
          </button>
        ))}
      </div>
    );
  }

  return null;
};

// CSS for industrial theme (add to your global CSS)
export const industrialThemeStyles = `
.industrial {
  /* Base colors */
  --background: 220 13% 10%;
  --foreground: 0 0% 98%;
  
  /* Component colors */
  --card: 220 13% 13%;
  --card-foreground: 0 0% 98%;
  --popover: 220 13% 13%;
  --popover-foreground: 0 0% 98%;
  
  /* Primary - bright orange for visibility */
  --primary: 38 92% 50%;
  --primary-foreground: 0 0% 10%;
  
  /* Secondary - muted blue */
  --secondary: 215 20% 25%;
  --secondary-foreground: 0 0% 98%;
  
  /* Muted colors */
  --muted: 220 13% 20%;
  --muted-foreground: 0 0% 70%;
  
  /* Accent colors */
  --accent: 38 92% 50%;
  --accent-foreground: 0 0% 10%;
  
  /* Status colors - high visibility */
  --destructive: 0 84% 50%;
  --destructive-foreground: 0 0% 98%;
  
  /* Borders and inputs */
  --border: 220 13% 25%;
  --input: 220 13% 25%;
  --ring: 38 92% 50%;
  
  /* Additional industrial-specific variables */
  --warning: 45 100% 50%;
  --success: 120 60% 45%;
  --info: 200 70% 50%;
}
`;

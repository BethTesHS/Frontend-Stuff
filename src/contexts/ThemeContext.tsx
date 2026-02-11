import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Dashboard routes where dark mode should be applied
const DASHBOARD_ROUTES = [
  '/dashboard',
  '/tenant-dashboard',
  '/agent-dashboard',
  '/owner-dashboard',
  '/buyer-dashboard',
  '/admin-dashboard',
  '/agency-dashboard',
  '/external-tenant-dashboard',
  '/properties',
  '/agents',
  '/messages',
  '/viewings',
  '/analytics',
  '/reports',
  '/tenants',
  '/settings'
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <ThemeApplier theme={theme} />
      {children}
    </ThemeContext.Provider>
  );
};


const ThemeApplier: React.FC<{ theme: Theme }> = ({ theme }) => {
  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const isDashboardRoute = DASHBOARD_ROUTES.some(route => location.pathname.startsWith(route));

    if (theme === 'dark' && isDashboardRoute) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, location.pathname]);

  return null;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

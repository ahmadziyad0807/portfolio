import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import aiTheme from '../styles/aiTheme';
import darkTheme from '../styles/themes/darkTheme';
import lightTheme from '../styles/themes/lightTheme';
import purpleTheme from '../styles/themes/purpleTheme';
import greenTheme from '../styles/themes/greenTheme';

export type ThemeType = 'ai' | 'dark' | 'light' | 'purple' | 'green';

export interface Theme {
  gradients: any;
  colors: any;
  glass: any;
  shadows: any;
  animations: any;
  spacing: any;
  borderRadius: any;
  typography: any;
}

export interface ThemeOption {
  id: ThemeType;
  name: string;
  description: string;
  preview: string;
}

export const themeOptions: ThemeOption[] = [
  {
    id: 'ai',
    name: 'AI Modern',
    description: 'Modern minimalistic dark theme with AI aesthetics',
    preview: '#0D0D0D'
  },
  {
    id: 'dark',
    name: 'Dark Professional',
    description: 'Professional dark theme with blue accents',
    preview: '#111827'
  },
  {
    id: 'light',
    name: 'Light Professional',
    description: 'Clean light theme for professional use',
    preview: '#FFFFFF'
  },
  {
    id: 'purple',
    name: 'Purple Gradient',
    description: 'Modern purple gradient theme with elegant styling',
    preview: '#0F0A1E'
  },
  {
    id: 'green',
    name: 'Green Tech',
    description: 'Sleek green technology theme with modern aesthetics',
    preview: '#022C22'
  }
];

const themes: Record<ThemeType, Theme> = {
  ai: aiTheme,
  dark: darkTheme,
  light: lightTheme,
  purple: purpleTheme,
  green: greenTheme
};

interface ThemeContextType {
  currentTheme: ThemeType;
  theme: Theme;
  setTheme: (theme: ThemeType) => void;
  themeOptions: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('ai');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme') as ThemeType;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when changed
  useEffect(() => {
    localStorage.setItem('portfolio-theme', currentTheme);
  }, [currentTheme]);

  const setTheme = (theme: ThemeType) => {
    setCurrentTheme(theme);
  };

  const value: ThemeContextType = {
    currentTheme,
    theme: themes[currentTheme],
    setTheme,
    themeOptions
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
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

export default ThemeContext;
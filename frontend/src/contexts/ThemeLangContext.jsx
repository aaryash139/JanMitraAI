import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../translations';

const ThemeLangContext = createContext();

export function ThemeLangProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('dark');

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const t = translations[lang] || translations['en'];

  return (
    <ThemeLangContext.Provider value={{ lang, setLang, theme, toggleTheme, t }}>
      {children}
    </ThemeLangContext.Provider>
  );
}

export function useThemeLang() {
  return useContext(ThemeLangContext);
}

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEME_KEY = '80-20-exam-theme';
const DARK = 'dark';
const LIGHT = 'light';

const ThemeContext = createContext();

const getSystemPreference = () => {
  if (typeof window === 'undefined') return DARK;
  try {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    return mq.matches ? LIGHT : DARK;
  } catch {
    return DARK;
  }
};

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === LIGHT || stored === DARK) return stored;
  } catch {}
  return getSystemPreference();
};

const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  if (theme === LIGHT) {
    document.documentElement.setAttribute('data-theme', LIGHT);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    let mq;
    try {
      mq = window.matchMedia('(prefers-color-scheme: light)');
    } catch {
      return;
    }
    const handler = (e) => {
      try {
        const stored = localStorage.getItem(THEME_KEY);
        if (!stored) {
          setThemeState(e.matches ? LIGHT : DARK);
        }
      } catch {
        setThemeState(e.matches ? LIGHT : DARK);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback((t) => {
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === DARK ? LIGHT : DARK));
  }, []);

  const isDark = theme === DARK;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export { DARK, LIGHT };

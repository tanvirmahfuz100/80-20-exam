import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEME_KEY = '80-20-exam-theme';
const DARK = 'dark';
const LIGHT = 'light';
const FONT_SIZE_KEY = '80-20-exam-font-size';

const FONT_SIZE_MAP = {
  small: '14px',
  normal: '16px',
  large: '18px',
  xlarge: '21px',
};

const FONT_SIZE_LABELS = {
  small: 'Small (14px)',
  normal: 'Normal (16px)',
  large: 'Large (18px)',
  xlarge: 'X-Large (21px)',
};

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
  return DARK;
};

const getInitialFontSize = () => {
  try {
    const stored = localStorage.getItem(FONT_SIZE_KEY);
    if (stored && FONT_SIZE_MAP[stored]) return stored;
  } catch {}
  return 'normal';
};

const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  if (theme === LIGHT) {
    document.documentElement.setAttribute('data-theme', LIGHT);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  // Update theme-color meta
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.content = theme === LIGHT ? '#faf5f0' : '#080407';
  }
};

const applyFontSize = (sizeKey) => {
  if (typeof document === 'undefined') return;
  const v = FONT_SIZE_MAP[sizeKey] || FONT_SIZE_MAP.normal;
  document.documentElement.style.setProperty('--app-font-size', v);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => getInitialTheme());
  const [fontSize, setFontSizeState] = useState(() => getInitialFontSize());

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    applyFontSize(fontSize);
    try {
      localStorage.setItem(FONT_SIZE_KEY, fontSize);
    } catch {}
  }, [fontSize]);

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

  const setFontSize = useCallback((sizeKey) => {
    if (!FONT_SIZE_MAP[sizeKey]) return;
    setFontSizeState(sizeKey);
  }, []);

  const isDark = theme === DARK;

  return (
    <ThemeContext.Provider value={{
      theme, setTheme, toggleTheme, isDark,
      fontSize, setFontSize,
      fontSizeValue: FONT_SIZE_MAP[fontSize] || FONT_SIZE_MAP.normal,
      fontSizeOptions: Object.entries(FONT_SIZE_MAP).map(([key, val]) => ({
        key,
        label: FONT_SIZE_LABELS[key] || key,
        value: val,
      })),
    }}>
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

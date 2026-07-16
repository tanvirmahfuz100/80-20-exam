import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'duo-theme';
const SYSTEM = 'system';
const DARK = 'dark';
const LIGHT = 'light';
const FONT_SIZE_KEY = 'fireman-font-size';
const CUSTOM_FONT_SIZE_KEY = 'fireman-custom-font-size';

const THEMES = [DARK, LIGHT, SYSTEM] as const;

const FONT_SIZE_MAP: Record<string, string> = {
  small: '14px',
  normal: '16px',
  large: '18px',
  xlarge: '21px',
};

const FONT_SIZE_LABELS: Record<string, string> = {
  small: 'Small (14px)',
  normal: 'Normal (16px)',
  large: 'Large (18px)',
  xlarge: 'X-Large (21px)',
};

interface ThemeContextValue {
  theme: string;
  setTheme: (t: string) => void;
  toggleTheme: () => void;
  isDark: boolean;
  fontSize: string;
  setFontSize: (s: string) => void;
  customFontSize: string;
  setCustomFontSize: (px: string) => void;
  fontSizeValue: string;
  fontSizeOptions: { key: string; label: string; value: string }[];
}

const ThemeContext = createContext<ThemeContextValue>({} as ThemeContextValue);

const getSystemPreference = () => {
  if (typeof window === 'undefined') return LIGHT;
  try {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    return mq.matches ? LIGHT : DARK;
  } catch {
    return LIGHT;
  }
};

const resolveTheme = (theme: string) => {
  if (theme === SYSTEM) return getSystemPreference();
  return theme;
};

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (THEMES.includes(stored as any)) return stored;
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

const applyTheme = (theme: string) => {
  if (typeof document === 'undefined') return;
  const resolved = resolveTheme(theme);
  if (resolved === DARK) {
    document.documentElement.setAttribute('data-theme', DARK);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) {
    meta.content = resolved === DARK ? '#000000' : '#F5F5F0';
  }
};

const applyFontSize = (sizeKey: string) => {
  if (typeof document === 'undefined') return;
  const v = FONT_SIZE_MAP[sizeKey] || FONT_SIZE_MAP.normal;
  document.documentElement.style.setProperty('--app-font-size', v);
};

const getInitialCustomFontSize = () => {
  try {
    const stored = localStorage.getItem(CUSTOM_FONT_SIZE_KEY);
    if (stored && !isNaN(Number(stored))) return stored;
  } catch {}
  return '';
};

const applyCustomFontSize = (px: string) => {
  if (typeof document === 'undefined') return;
  if (px && !isNaN(Number(px))) {
    document.documentElement.style.setProperty('--app-font-size', `${px}px`);
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => getInitialTheme());
  const [fontSize, setFontSizeState] = useState(() => getInitialFontSize());
  const [customFontSize, setCustomFontSizeState] = useState(() => getInitialCustomFontSize());

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    if (customFontSize) {
      applyCustomFontSize(customFontSize);
    } else {
      applyFontSize(fontSize);
    }
    try {
      localStorage.setItem(FONT_SIZE_KEY, fontSize);
    } catch {}
  }, [fontSize, customFontSize]);

  useEffect(() => {
    let mq;
    try {
      mq = window.matchMedia('(prefers-color-scheme: light)');
    } catch {
      return;
    }
    const handler = () => {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === SYSTEM || !stored) {
        applyTheme(SYSTEM);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback((t: string) => {
    if (!THEMES.includes(t as any)) return;
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev: string) => {
      if (prev === DARK) return LIGHT;
      if (prev === LIGHT) return DARK;
      const sys = getSystemPreference();
      return sys === DARK ? LIGHT : DARK;
    });
  }, []);

  const setFontSize = useCallback((sizeKey: string) => {
    if (!FONT_SIZE_MAP[sizeKey]) return;
    setFontSizeState(sizeKey);
    setCustomFontSizeState('');
    try { localStorage.removeItem(CUSTOM_FONT_SIZE_KEY); } catch {}
  }, []);

  const setCustomFontSize = useCallback((px: string) => {
    setCustomFontSizeState(px);
    if (px && !isNaN(Number(px))) {
      applyCustomFontSize(px);
      try { localStorage.setItem(CUSTOM_FONT_SIZE_KEY, px); } catch {}
    }
  }, []);

  const isDark = resolveTheme(theme) === DARK;

  return (
    <ThemeContext.Provider value={{
      theme, setTheme, toggleTheme, isDark,
      fontSize, setFontSize,
      customFontSize, setCustomFontSize,
      fontSizeValue: customFontSize ? `${customFontSize}px` : (FONT_SIZE_MAP[fontSize] || FONT_SIZE_MAP.normal),
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

export { DARK, LIGHT, SYSTEM };

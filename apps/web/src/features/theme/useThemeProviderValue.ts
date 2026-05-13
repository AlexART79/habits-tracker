import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { THEME_STORAGE_KEY } from './themeConstants';
import type { ThemeContextValue } from './themeContext';
import { applyTheme, getNextTheme, readStoredTheme } from './themeUtils';

export function useThemeProviderValue(): ThemeContextValue {
  const [theme, setTheme] = useState(readStoredTheme);

  useLayoutEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(getNextTheme);
  }, []);

  return useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme,
    }),
    [theme, toggleTheme],
  );
}

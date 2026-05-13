import { THEME_COPY, THEME_STORAGE_KEY } from './themeConstants';
import type { Theme } from './themeContext';

export function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dataset.theme = theme;
}

export function getThemeToggleLabel(theme: Theme): string {
  return theme === 'dark' ? THEME_COPY.switchToLight : THEME_COPY.switchToDark;
}

export function getNextTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark';
}

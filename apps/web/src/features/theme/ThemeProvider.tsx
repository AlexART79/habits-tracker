/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import { ThemeContext } from './themeContext';
import { useThemeProviderValue } from './useThemeProviderValue';

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const value = useThemeProviderValue();

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

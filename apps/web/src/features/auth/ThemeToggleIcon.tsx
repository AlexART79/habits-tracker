import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme/useTheme';

export function ThemeToggleIcon(): JSX.Element {
  const { theme } = useTheme();
  const Icon = theme === 'dark' ? Sun : Moon;

  return <Icon className="h-4 w-4" aria-hidden="true" />;
}

import { useTheme } from '../context/ThemeContext';
import { IconBtn } from './IconBtn';
import { IconMoon, IconSun } from './icons';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <IconBtn
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
    >
      {isDark ? <IconSun /> : <IconMoon />}
    </IconBtn>
  );
}

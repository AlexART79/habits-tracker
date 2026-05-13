import { LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '../../components/Button';
import { HabitDashboard } from '../habits/HabitDashboard';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from './AuthProvider';

export function ProtectedShell(): JSX.Element {
  const { errorMessage, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const switchThemeLabel =
    theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  const ThemeIcon = theme === 'dark' ? Sun : Moon;
  const initials = user?.displayName
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6">
      <header className="mx-auto mb-6 flex w-full max-w-6xl flex-col gap-4 rounded-lg border border-slate-200 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            Habit Tracker with Streaks
          </p>
          <h1 className="text-3xl font-bold">Focused Dashboard</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white dark:bg-emerald-400 dark:text-slate-950">
              {initials || 'U'}
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {user?.displayName}
            </span>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={toggleTheme}
            aria-label={switchThemeLabel}
          >
            <ThemeIcon className="h-4 w-4" aria-hidden="true" />
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
          <Button type="button" onClick={() => void logout()}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl">
        {errorMessage ? (
          <p role="alert" className="mb-4 font-medium text-red-700 dark:text-red-300">
            {errorMessage}
          </p>
        ) : null}

        <HabitDashboard />
      </div>
    </main>
  );
}

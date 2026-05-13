import { LogOut, Moon, Sun } from 'lucide-react';
import { IconButton } from '../../components/IconButton';
import { HabitDashboard } from '../habits/HabitDashboard';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from './AuthProvider';
import { UserProfileCard } from './UserProfileCard';

export function ProtectedShell(): JSX.Element {
  const { errorMessage, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const switchThemeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  const ThemeIcon = theme === 'dark' ? Sun : Moon;

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
          <UserProfileCard user={user} />
          <IconButton type="button" onClick={() => void logout()} aria-label="Log out">
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </IconButton>
          <IconButton
            type="button"
            variant="secondary"
            onClick={toggleTheme}
            aria-label={switchThemeLabel}
          >
            <ThemeIcon className="h-4 w-4" aria-hidden="true" />
          </IconButton>
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

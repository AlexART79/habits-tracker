import { HabitDashboard } from '../habits/HabitDashboard';
import { MilestoneNotifications } from '../notifications/MilestoneNotifications';
import { getThemeToggleLabel } from '../theme/themeUtils';
import { useTheme } from '../theme/useTheme';
import { ProtectedShellHeader } from './ProtectedShellHeader';
import { ShellErrorBanner } from './ShellErrorBanner';
import { useAuth } from './useAuth';

export function ProtectedShell(): JSX.Element {
  const { errorMessage, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <ProtectedShellHeader
        onLogout={() => void logout()}
        onToggleTheme={toggleTheme}
        themeLabel={getThemeToggleLabel(theme)}
        user={user}
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        {errorMessage ? <ShellErrorBanner message={errorMessage} /> : null}

        <MilestoneNotifications />
        <HabitDashboard />
      </div>
    </main>
  );
}

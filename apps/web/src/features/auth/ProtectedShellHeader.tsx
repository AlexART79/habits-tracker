import type { AuthUserResponse } from '@habit-tracker/shared';
import { ShellActions } from './ShellActions';
import { SHELL_COPY } from './shellConstants';

type ProtectedShellHeaderProps = {
  onLogout: () => void;
  onToggleTheme: () => void;
  themeLabel: string;
  user: AuthUserResponse | null;
};

export function ProtectedShellHeader({
  onLogout,
  onToggleTheme,
  themeLabel,
  user,
}: ProtectedShellHeaderProps): JSX.Element {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 shadow-md backdrop-blur dark:bg-slate-900/95">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            {SHELL_COPY.brand}
          </p>
          <h1 className="text-3xl font-bold">{SHELL_COPY.title}</h1>
        </div>
        <ShellActions
          onLogout={onLogout}
          onToggleTheme={onToggleTheme}
          themeLabel={themeLabel}
          user={user}
        />
      </div>
    </header>
  );
}

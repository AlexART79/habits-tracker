import type { AuthUserResponse } from '@habit-tracker/shared';
import { LogOut } from 'lucide-react';
import { IconButton } from '../../components/IconButton';
import { AUTH_COPY } from './authConstants';
import { ThemeToggleIcon } from './ThemeToggleIcon';
import { UserProfileCard } from './UserProfileCard';

type ShellActionsProps = {
  onLogout: () => void;
  onToggleTheme: () => void;
  themeLabel: string;
  user: AuthUserResponse | null;
};

export function ShellActions({
  onLogout,
  onToggleTheme,
  themeLabel,
  user,
}: ShellActionsProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <UserProfileCard user={user} />
      <IconButton type="button" onClick={onLogout} aria-label={AUTH_COPY.logoutLabel}>
        <LogOut className="h-4 w-4" aria-hidden="true" />
      </IconButton>
      <IconButton
        type="button"
        variant="secondary"
        onClick={onToggleTheme}
        aria-label={themeLabel}
      >
        <ThemeToggleIcon />
      </IconButton>
    </div>
  );
}

import type { AuthUserResponse } from '@habit-tracker/shared';

type UserProfileCardProps = {
  user: AuthUserResponse | null;
};

function getInitials(displayName?: string): string {
  return (
    displayName
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'
  );
}

export function UserProfileCard({ user }: UserProfileCardProps): JSX.Element {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white dark:bg-emerald-400 dark:text-slate-950">
        {getInitials(user?.displayName)}
      </span>
      <span className="truncate font-medium text-slate-700 dark:text-slate-200">
        {user?.displayName}
      </span>
    </div>
  );
}

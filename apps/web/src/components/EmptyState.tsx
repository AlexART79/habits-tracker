import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
};

export function EmptyState({
  children,
  icon: Icon,
  title,
}: EmptyStateProps): JSX.Element {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-bold text-slate-950 dark:text-white">
        {title}
      </h2>
      <p className="mt-2 max-w-xl text-slate-700 dark:text-slate-300">
        {children}
      </p>
    </div>
  );
}

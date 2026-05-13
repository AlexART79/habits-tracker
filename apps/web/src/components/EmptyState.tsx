import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { COMPONENT_CLASSES } from './componentStyles';

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
    <div className={COMPONENT_CLASSES.emptyState}>
      <div className={COMPONENT_CLASSES.emptyStateIcon}>
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

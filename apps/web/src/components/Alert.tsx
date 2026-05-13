import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';

type AlertProps = {
  children: ReactNode;
  className?: string;
};

export function Alert({ children, className = '' }: AlertProps): JSX.Element {
  return (
    <p
      role="alert"
      className={[
        'inline-flex items-start gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 font-medium text-red-800',
        'dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200',
        className,
      ].join(' ')}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

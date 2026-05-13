import type { ReactNode } from 'react';

type BadgeTone = 'success' | 'warning' | 'neutral';

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  success:
    'border-emerald-400/40 bg-emerald-400/10 text-emerald-200 dark:text-emerald-200',
  warning:
    'border-amber-400/40 bg-amber-400/10 text-amber-200 dark:text-amber-200',
  neutral:
    'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
};

export function Badge({ children, tone = 'neutral' }: BadgeProps): JSX.Element {
  return (
    <span
      className={[
        'inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide',
        toneClasses[tone],
      ].join(' ')}
    >
      {children}
    </span>
  );
}

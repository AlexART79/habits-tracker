export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export type BadgeTone = 'success' | 'warning' | 'neutral';

export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'border-emerald-500 bg-emerald-600 text-white hover:border-emerald-500 hover:bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300',
  secondary:
    'border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800',
  danger:
    'border-red-600 bg-red-600 text-white hover:border-red-500 hover:bg-red-500 dark:border-red-500 dark:bg-red-500 dark:text-white dark:hover:bg-red-400',
  ghost:
    'border-transparent bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900',
};

export const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  success:
    'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-200',
  warning:
    'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200',
  neutral:
    'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
};

export const COMPONENT_CLASSES = {
  alert:
    'inline-flex items-start gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 font-medium text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200',
  badge:
    'inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide',
  button:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 font-bold transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-emerald-300 disabled:cursor-not-allowed disabled:opacity-60',
  card: 'rounded-lg border border-slate-200 bg-white/90 shadow-sm shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-black/20',
  emptyState:
    'rounded-lg border border-dashed border-slate-300 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70',
  emptyStateIcon:
    'mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200',
  iconButton:
    'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-emerald-300 disabled:cursor-not-allowed disabled:opacity-60',
  input:
    'min-h-11 w-full rounded-md border border-slate-300 bg-white px-3.5 text-slate-950 transition-colors placeholder:text-slate-400 hover:border-slate-400 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:disabled:bg-slate-800 dark:disabled:text-slate-500',
} as const;

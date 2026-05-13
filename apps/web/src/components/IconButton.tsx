import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: IconButtonVariant;
};

const variantClasses: Record<IconButtonVariant, string> = {
  primary:
    'border-emerald-500 bg-emerald-500 text-slate-950 hover:border-emerald-400 hover:bg-emerald-400 dark:border-emerald-400 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300',
  secondary:
    'border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800',
  danger:
    'border-red-600 bg-red-600 text-white hover:border-red-500 hover:bg-red-500 dark:border-red-500 dark:bg-red-500 dark:text-white dark:hover:bg-red-400',
  ghost:
    'border-transparent bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900',
};

export function IconButton({
  children,
  className = '',
  type = 'button',
  variant = 'secondary',
  ...props
}: IconButtonProps): JSX.Element {
  return (
    <button
      type={type}
      className={[
        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition-colors',
        'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-emerald-300',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

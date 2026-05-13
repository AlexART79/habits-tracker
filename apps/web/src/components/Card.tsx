import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type CardProps = ComponentPropsWithoutRef<'section'> & {
  children: ReactNode;
};

export function Card({
  children,
  className = '',
  ...props
}: CardProps): JSX.Element {
  return (
    <section
      className={[
        'rounded-lg border border-slate-200 bg-white/90 shadow-sm shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-black/20',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </section>
  );
}

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
        'rounded-lg border border-slate-200 bg-white shadow-md',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </section>
  );
}

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { COMPONENT_CLASSES } from './componentStyles';

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
        COMPONENT_CLASSES.card,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </section>
  );
}

import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { COMPONENT_CLASSES } from './componentStyles';

type AlertProps = {
  children: ReactNode;
  className?: string;
};

export function Alert({ children, className = '' }: AlertProps): JSX.Element {
  return (
    <p
      role="alert"
      className={[
        COMPONENT_CLASSES.alert,
        className,
      ].join(' ')}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

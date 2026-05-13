import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { BUTTON_VARIANT_CLASSES, COMPONENT_CLASSES, type ButtonVariant } from './componentStyles';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

export function Button({
  children,
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      type={type}
      className={[
        COMPONENT_CLASSES.button,
        BUTTON_VARIANT_CLASSES[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { BUTTON_VARIANT_CLASSES, COMPONENT_CLASSES, type ButtonVariant } from './componentStyles';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
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
        COMPONENT_CLASSES.iconButton,
        BUTTON_VARIANT_CLASSES[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

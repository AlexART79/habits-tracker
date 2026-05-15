import React from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border-transparent',
  secondary: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-300 border-gray-300 dark:border-gray-600',
};

export function Button({ variant = 'primary', children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center px-4 py-2 rounded-md border text-sm font-medium',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

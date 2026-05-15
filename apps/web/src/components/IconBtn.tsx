import React from 'react';

interface IconBtnProps {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function IconBtn({ title, onClick, disabled, className = '', children }: IconBtnProps) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`w-9 h-9 flex items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 dark:ring-offset-gray-900 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

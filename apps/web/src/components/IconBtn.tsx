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
      className={`w-9 h-9 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

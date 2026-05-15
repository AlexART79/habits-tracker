import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div
      className={[
        'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6',
        className,
      ].join(' ')}
    >
      {title && <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">{title}</h2>}
      {children}
    </div>
  );
}

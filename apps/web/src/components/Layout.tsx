import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

export function Layout({ children, headerRight }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Habit Tracker</h1>
          {headerRight && <div>{headerRight}</div>}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}

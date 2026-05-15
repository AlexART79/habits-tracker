import { useEffect, useRef, useState } from 'react';
import type { HabitFilters, HabitStatus } from './types';
import {
  FILTER_DEBOUNCE_MS,
  STATUS_FILTER_OPTIONS,
  COMPLETION_FILTER_OPTIONS,
} from './constants';

interface HabitFiltersProps {
  filters: HabitFilters;
  onChange: (filters: HabitFilters) => void;
}

export function HabitFilters({ filters, onChange }: HabitFiltersProps) {
  const [searchDraft, setSearchDraft] = useState(filters.search ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange({ ...filters, search: searchDraft || undefined });
    }, FILTER_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // Intentionally omit `filters` to avoid re-triggering on every parent update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange({ ...filters, status: (e.target.value as HabitStatus) || '' });
  }

  function handleCompletedTodayChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    const completedToday = val === 'true' ? true : val === 'false' ? false : null;
    onChange({ ...filters, completedToday });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <input
        type="search"
        aria-label="Search habits"
        placeholder="Search habits…"
        value={searchDraft}
        onChange={(e) => setSearchDraft(e.target.value)}
        className="flex-1 min-w-0 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div className="relative sm:w-40">
        <select
          aria-label="Filter by status"
          value={filters.status ?? ''}
          onChange={handleStatusChange}
          className="w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-3 pr-8 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      <div className="relative sm:w-48">
        <select
          aria-label="Filter by completion"
          value={
            filters.completedToday === true
              ? 'true'
              : filters.completedToday === false
                ? 'false'
                : ''
          }
          onChange={handleCompletedTodayChange}
          className="w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-3 pr-8 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {COMPLETION_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
}

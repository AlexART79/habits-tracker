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
        className="flex-1 min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <select
        aria-label="Filter by status"
        value={filters.status ?? ''}
        onChange={handleStatusChange}
        className="sm:w-40 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
        className="sm:w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {COMPLETION_FILTER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

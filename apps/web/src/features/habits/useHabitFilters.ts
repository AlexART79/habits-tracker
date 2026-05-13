import { useMemo, useState } from 'react';
import type { ListHabitsRequest } from '@habit-tracker/shared';
import { HABIT_FILTER_DEBOUNCE_MS } from './habitConstants';
import type { CompletedTodayFilter, HabitStatusFilter } from './habitTypes';
import { getHabitFilters, getHasActiveFilters, isTodayFilterDisabled } from './habitUtils';
import { useDebouncedValue } from './useDebouncedValue';

export function useHabitFilters() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<HabitStatusFilter>('');
  const [completedToday, setCompletedToday] = useState<CompletedTodayFilter>('');
  const debouncedSearch = useDebouncedValue(search, HABIT_FILTER_DEBOUNCE_MS);

  const filters = useMemo<ListHabitsRequest>(
    () => getHabitFilters(debouncedSearch, status, completedToday),
    [completedToday, debouncedSearch, status],
  );
  const hasActiveFilters = getHasActiveFilters(search, status, completedToday);
  const todayFilterDisabled = isTodayFilterDisabled(status);

  function changeStatus(value: HabitStatusFilter): void {
    setStatus(value);

    if (isTodayFilterDisabled(value)) {
      setCompletedToday('');
    }
  }

  function clearFilters(): void {
    setSearch('');
    setStatus('');
    setCompletedToday('');
  }

  return {
    completedToday,
    filters,
    hasActiveFilters,
    search,
    status,
    todayFilterDisabled,
    changeStatus,
    clearFilters,
    setCompletedToday,
    setSearch,
  };
}

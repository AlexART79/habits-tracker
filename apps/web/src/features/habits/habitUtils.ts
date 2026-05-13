import type { HabitResponse, ListHabitsRequest } from '@habit-tracker/shared';
import type { CompletedTodayFilter, HabitStats, HabitStatusFilter } from './habitTypes';

export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function isTodayFilterDisabled(status: HabitStatusFilter): boolean {
  return status === 'PAUSED' || status === 'ARCHIVED';
}

export function getHabitFilters(
  search: string,
  status: HabitStatusFilter,
  completedToday: CompletedTodayFilter,
): ListHabitsRequest {
  const filters: ListHabitsRequest = {};
  const trimmedSearch = search.trim();

  if (trimmedSearch) {
    filters.search = trimmedSearch;
  }

  if (status) {
    filters.status = status;
  }

  if (completedToday) {
    filters.completedToday = completedToday === 'true';
  }

  return filters;
}

export function getHasActiveFilters(
  search: string,
  status: HabitStatusFilter,
  completedToday: CompletedTodayFilter,
): boolean {
  return search.trim() !== '' || status !== '' || completedToday !== '';
}

export function getHabitStats(habits: HabitResponse[]): HabitStats {
  return {
    total: habits.length,
    active: habits.filter((habit) => habit.status === 'ACTIVE').length,
    paused: habits.filter((habit) => habit.status === 'PAUSED').length,
    archived: habits.filter((habit) => habit.status === 'ARCHIVED').length,
  };
}

export function getStatusTone(status: HabitResponse['status']): 'success' | 'warning' | 'neutral' {
  if (status === 'ACTIVE') {
    return 'success';
  }

  if (status === 'PAUSED') {
    return 'warning';
  }

  return 'neutral';
}

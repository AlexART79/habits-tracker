import { Filter, Search, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import {
  COMPLETED_TODAY_OPTIONS,
  HABIT_COPY,
  HABIT_STATUS_OPTIONS,
} from './habitConstants';
import type { CompletedTodayFilter, HabitStatusFilter } from './habitTypes';

type HabitFiltersProps = {
  completedToday: CompletedTodayFilter;
  hasActiveFilters: boolean;
  search: string;
  status: HabitStatusFilter;
  todayFilterDisabled: boolean;
  onClear: () => void;
  onCompletedTodayChange: (value: CompletedTodayFilter) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: HabitStatusFilter) => void;
};

export function HabitFilters({
  completedToday,
  hasActiveFilters,
  onClear,
  onCompletedTodayChange,
  onSearchChange,
  onStatusChange,
  search,
  status,
  todayFilterDisabled,
}: HabitFiltersProps): JSX.Element {
  return (
    <section
      aria-label="Habit filters"
      className="grid gap-3 rounded-lg border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/75"
    >
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <Filter className="h-4 w-4" aria-hidden="true" />
        {HABIT_COPY.filters}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(10rem,14rem)_minmax(10rem,14rem)_auto] lg:items-end">
        <div className="relative">
          <Input
            label={HABIT_COPY.searchLabel}
            name="habit-search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={HABIT_COPY.searchPlaceholder}
            className="pl-10"
          />
          <Search
            className="pointer-events-none absolute bottom-3.5 left-3.5 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
        </div>

        <label className="grid gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          {HABIT_COPY.statusLabel}
          <select
            className={[
              'min-h-11 w-full rounded-md border border-slate-300 bg-white px-3.5 text-slate-950',
              'transition-colors hover:border-slate-400',
              'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-emerald-300',
              'dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600',
            ].join(' ')}
            value={status}
            onChange={(event) => onStatusChange(event.target.value as HabitStatusFilter)}
          >
            {HABIT_STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          {HABIT_COPY.todayLabel}
          <select
            className={[
              'min-h-11 w-full rounded-md border border-slate-300 bg-white px-3.5 text-slate-950',
              'transition-colors hover:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-70',
              'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-emerald-300',
              'dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600 dark:disabled:bg-slate-800 dark:disabled:text-slate-500',
            ].join(' ')}
            value={todayFilterDisabled ? '' : completedToday}
            onChange={(event) =>
              onCompletedTodayChange(event.target.value as CompletedTodayFilter)
            }
            disabled={todayFilterDisabled}
          >
            {COMPLETED_TODAY_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {hasActiveFilters ? (
          <Button type="button" variant="secondary" onClick={onClear} className="w-full lg:w-auto">
            <X className="h-4 w-4" aria-hidden="true" />
            {HABIT_COPY.clearFilters}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

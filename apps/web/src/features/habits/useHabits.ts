import { useState, useEffect, useCallback, useRef } from 'react';
import type { HabitWithStats, HabitFilters, HabitStatus } from './types';
import { fetchHabits } from './habitsApi';

const STATUS_ORDER: Record<HabitStatus, number> = { ACTIVE: 0, PAUSED: 1, ARCHIVED: 2 };

function sortHabits(habits: HabitWithStats[]): HabitWithStats[] {
  return [...habits].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    return a.startDate.localeCompare(b.startDate);
  });
}

interface HabitsState {
  habits: HabitWithStats[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useHabits(filters?: HabitFilters): HabitsState {
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((n) => n + 1), []);

  const search = filters?.search;
  const status = filters?.status;
  const completedToday = filters?.completedToday;

  // Track previous filter values to distinguish action-triggered reloads from filter changes.
  // Action reloads (tick-only changes) refresh silently without showing the loading skeleton,
  // which prevents the page from collapsing and scrolling to the top.
  const prevRef = useRef({ search, status, completedToday, tick: -1 });

  useEffect(() => {
    const prev = prevRef.current;
    const isActionReload =
      tick !== prev.tick &&
      search === prev.search &&
      status === prev.status &&
      completedToday === prev.completedToday;
    prevRef.current = { search, status, completedToday, tick };

    let cancelled = false;
    if (!isActionReload) setLoading(true);
    setError(null);
    fetchHabits(filters)
      .then((data) => {
        if (!cancelled) setHabits(sortHabits(data));
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load habits');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, search, status, completedToday]);

  return { habits, loading, error, reload };
}

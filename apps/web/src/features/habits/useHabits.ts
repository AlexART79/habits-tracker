import { useState, useEffect, useCallback } from 'react';
import type { HabitWithStats, HabitFilters } from './types';
import { fetchHabits } from './habitsApi';

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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchHabits(filters)
      .then((data) => {
        if (!cancelled) setHabits(data);
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

import { useState, useEffect, useCallback } from 'react';
import type { Habit } from './types';
import { fetchHabits } from './habitsApi';

interface HabitsState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useHabits(): HabitsState {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchHabits()
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
  }, [tick]);

  return { habits, loading, error, reload };
}

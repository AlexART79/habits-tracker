import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CreateHabitRequest,
  HabitResponse,
  HabitStatus,
  UpdateHabitRequest,
} from '@habit-tracker/shared';
import {
  checkInToday,
  createHabit,
  deleteHabit,
  listHabits,
  undoTodayCheckIn,
  updateHabit,
} from '../../lib/apiClient';
import { HABIT_COPY } from './habitConstants';
import type { HabitFormState } from './habitTypes';
import { getHabitStats } from './habitUtils';
import { useHabitFilters } from './useHabitFilters';

export function useHabitDashboard() {
  const filterState = useHabitFilters();
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formState, setFormState] = useState<HabitFormState>(null);
  const [archivingHabitId, setArchivingHabitId] = useState<string | null>(null);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const listRequestId = useRef(0);

  const loadHabits = useCallback(async () => {
    const requestId = listRequestId.current + 1;
    listRequestId.current = requestId;
    setIsLoading(true);
    setListError(null);

    try {
      const response = await listHabits(filterState.filters);

      if (requestId === listRequestId.current) {
        setHabits(response.habits);
      }
    } catch (error) {
      if (requestId === listRequestId.current) {
        setListError(error instanceof Error ? error.message : HABIT_COPY.unableToLoadHabits);
      }
    } finally {
      if (requestId === listRequestId.current) {
        setIsLoading(false);
      }
    }
  }, [filterState.filters]);

  useEffect(() => {
    void loadHabits();
  }, [loadHabits]);

  async function submitHabit(request: CreateHabitRequest | UpdateHabitRequest): Promise<void> {
    setIsMutating(true);
    setFormError(null);

    try {
      if (formState?.mode === 'edit') {
        await updateHabit(formState.habit.id, request);
      } else {
        await createHabit(request as CreateHabitRequest);
      }

      setFormState(null);
      await loadHabits();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : HABIT_COPY.unableToSaveHabit);
    } finally {
      setIsMutating(false);
    }
  }

  async function changeHabitStatus(habit: HabitResponse, status: HabitStatus): Promise<void> {
    setIsMutating(true);
    setListError(null);

    try {
      await updateHabit(habit.id, { status });
      setArchivingHabitId(null);
      await loadHabits();
    } catch (error) {
      setListError(error instanceof Error ? error.message : HABIT_COPY.unableToUpdateHabit);
    } finally {
      setIsMutating(false);
    }
  }

  async function confirmDelete(habit: HabitResponse): Promise<void> {
    setIsMutating(true);
    setListError(null);

    try {
      await deleteHabit(habit.id);
      setDeletingHabitId(null);
      await loadHabits();
    } catch (error) {
      setListError(error instanceof Error ? error.message : HABIT_COPY.unableToDeleteHabit);
    } finally {
      setIsMutating(false);
    }
  }

  async function completeToday(habit: HabitResponse): Promise<void> {
    setIsMutating(true);
    setListError(null);

    try {
      await checkInToday(habit.id);
      await loadHabits();
    } catch (error) {
      setListError(error instanceof Error ? error.message : HABIT_COPY.unableToCheckInHabit);
    } finally {
      setIsMutating(false);
    }
  }

  async function undoToday(habit: HabitResponse): Promise<void> {
    setIsMutating(true);
    setListError(null);

    try {
      await undoTodayCheckIn(habit.id);
      await loadHabits();
    } catch (error) {
      setListError(error instanceof Error ? error.message : HABIT_COPY.unableToUndoCheckIn);
    } finally {
      setIsMutating(false);
    }
  }

  function startCreate(): void {
    setFormState({ mode: 'create' });
  }

  function startEdit(habit: HabitResponse): void {
    setArchivingHabitId(null);
    setDeletingHabitId(null);
    setFormError(null);
    setFormState({ mode: 'edit', habit });
  }

  function cancelForm(): void {
    setFormState(null);
    setFormError(null);
  }

  function requestArchive(habit: HabitResponse): void {
    setDeletingHabitId(null);
    setArchivingHabitId(habit.id);
  }

  function requestDelete(habit: HabitResponse): void {
    setArchivingHabitId(null);
    setDeletingHabitId(habit.id);
  }

  return {
    archivingHabitId,
    deletingHabitId,
    filterState,
    formError,
    formState,
    habits,
    isLoading,
    isMutating,
    listError,
    stats: getHabitStats(habits),
    cancelForm,
    changeHabitStatus,
    completeToday,
    confirmDelete,
    requestArchive,
    requestDelete,
    setArchivingHabitId,
    setDeletingHabitId,
    startCreate,
    startEdit,
    submitHabit,
    undoToday,
  };
}

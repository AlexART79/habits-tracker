import { useCallback, useEffect, useState } from 'react';
import type {
  CreateHabitRequest,
  HabitResponse,
  HabitStatus,
  UpdateHabitRequest,
} from '@habit-tracker/shared';
import { Button } from '../../components/Button';
import {
  createHabit,
  deleteHabit,
  listHabits,
  updateHabit,
} from '../../lib/apiClient';
import { HabitForm } from './HabitForm';
import { HabitList } from './HabitList';

type FormState =
  | { mode: 'create'; habit?: undefined }
  | { mode: 'edit'; habit: HabitResponse }
  | null;

export function HabitDashboard(): JSX.Element {
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(null);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);

  const loadHabits = useCallback(async () => {
    setIsLoading(true);
    setListError(null);
    try {
      const response = await listHabits();
      setHabits(response.habits);
    } catch (error) {
      setListError(error instanceof Error ? error.message : 'Unable to load habits.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      setFormError(error instanceof Error ? error.message : 'Unable to save habit.');
    } finally {
      setIsMutating(false);
    }
  }

  async function changeHabitStatus(
    habit: HabitResponse,
    status: HabitStatus,
  ): Promise<void> {
    setIsMutating(true);
    setListError(null);
    try {
      await updateHabit(habit.id, { status });
      await loadHabits();
    } catch (error) {
      setListError(error instanceof Error ? error.message : 'Unable to update habit.');
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
      setListError(error instanceof Error ? error.message : 'Unable to delete habit.');
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <section className="grid gap-5" aria-label="Habit dashboard">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Your habits</h2>
          <p className="text-slate-700">Create and manage your routine list.</p>
        </div>
        <Button type="button" onClick={() => setFormState({ mode: 'create' })}>
          Create habit
        </Button>
      </div>

      {formState ? (
        <HabitForm
          mode={formState.mode}
          habit={formState.mode === 'edit' ? formState.habit : undefined}
          isSaving={isMutating}
          serverError={formError}
          onCancel={() => {
            setFormState(null);
            setFormError(null);
          }}
          onSubmit={submitHabit}
        />
      ) : null}

      <HabitList
        deletingHabitId={deletingHabitId}
        errorMessage={listError}
        habits={habits}
        isLoading={isLoading}
        isMutating={isMutating}
        onDelete={confirmDelete}
        onEdit={(habit) => {
          setDeletingHabitId(null);
          setFormError(null);
          setFormState({ mode: 'edit', habit });
        }}
        onRequestDelete={(habit) => setDeletingHabitId(habit.id)}
        onStatusChange={changeHabitStatus}
      />
    </section>
  );
}

import { useCallback, useEffect, useState } from 'react';
import type {
  CreateHabitRequest,
  HabitResponse,
  HabitStatus,
  UpdateHabitRequest,
} from '@habit-tracker/shared';
import { Activity, Archive, CirclePause, CirclePlus, ListChecks } from 'lucide-react';
import { Button } from '../../components/Button';
import { StatTile } from '../../components/StatTile';
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

  const activeCount = habits.filter((habit) => habit.status === 'ACTIVE').length;
  const pausedCount = habits.filter((habit) => habit.status === 'PAUSED').length;
  const archivedCount = habits.filter((habit) => habit.status === 'ARCHIVED').length;

  return (
    <section className="grid gap-5" aria-label="Habit dashboard">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Today
          </p>
          <h2 className="text-3xl font-bold text-slate-950 dark:text-white">Your habits</h2>
          <p className="mt-1 text-slate-700 dark:text-slate-300">
            Create, review, and tune the routines you are tracking.
          </p>
        </div>
        <Button type="button" onClick={() => setFormState({ mode: 'create' })}>
          <CirclePlus className="h-4 w-4" aria-hidden="true" />
          Create habit
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={ListChecks} label="Total habits" value={habits.length} />
        <StatTile icon={Activity} label="Active" value={activeCount} />
        <StatTile icon={CirclePause} label="Paused" value={pausedCount} />
        <StatTile icon={Archive} label="Archived" value={archivedCount} />
      </div>

      {formState?.mode === 'create' ? (
        <HabitForm
          mode="create"
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
        editingHabit={formState?.mode === 'edit' ? formState.habit : null}
        editErrorMessage={formState?.mode === 'edit' ? formError : null}
        onCancelEdit={() => {
          setFormState(null);
          setFormError(null);
        }}
        onDelete={confirmDelete}
        onEdit={(habit) => {
          setDeletingHabitId(null);
          setFormError(null);
          setFormState({ mode: 'edit', habit });
        }}
        onCancelDelete={() => setDeletingHabitId(null)}
        onRequestDelete={(habit) => setDeletingHabitId(habit.id)}
        onSubmitEdit={submitHabit}
        onStatusChange={changeHabitStatus}
      />
    </section>
  );
}

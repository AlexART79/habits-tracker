import type {
  CreateHabitRequest,
  HabitResponse,
  HabitStatus,
  UpdateHabitRequest,
} from '@habit-tracker/shared';
import { ListPlus } from 'lucide-react';
import { Alert } from '../../components/Alert';
import { EmptyState } from '../../components/EmptyState';
import { HabitCard } from './HabitCard';
import { HabitForm } from './HabitForm';

type HabitListProps = {
  deletingHabitId: string | null;
  editingHabit: HabitResponse | null;
  editErrorMessage: string | null;
  errorMessage: string | null;
  habits: HabitResponse[];
  isLoading: boolean;
  isMutating: boolean;
  onCancelDelete: () => void;
  onCancelEdit: () => void;
  onDelete: (habit: HabitResponse) => Promise<void>;
  onEdit: (habit: HabitResponse) => void;
  onRequestDelete: (habit: HabitResponse) => void;
  onSubmitEdit: (request: CreateHabitRequest | UpdateHabitRequest) => Promise<void>;
  onStatusChange: (habit: HabitResponse, status: HabitStatus) => Promise<void>;
};

export function HabitList({
  deletingHabitId,
  editingHabit,
  editErrorMessage,
  errorMessage,
  habits,
  isLoading,
  isMutating,
  onCancelDelete,
  onCancelEdit,
  onDelete,
  onEdit,
  onRequestDelete,
  onSubmitEdit,
  onStatusChange,
}: HabitListProps): JSX.Element {
  if (isLoading) {
    return (
      <p
        role="status"
        className="rounded-lg border border-slate-200 bg-white/80 px-4 py-3 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200"
      >
        Loading habits...
      </p>
    );
  }

  if (errorMessage) {
    return <Alert>{errorMessage}</Alert>;
  }

  if (habits.length === 0) {
    return (
      <EmptyState icon={ListPlus} title="No habits yet.">
        Create your first habit to start tracking progress.
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-4" role="list" aria-label="Habit list">
      {habits.map((habit) => (
        <div key={habit.id} role="listitem">
          {editingHabit?.id === habit.id ? (
            <HabitForm
              mode="edit"
              habit={editingHabit}
              isSaving={isMutating}
              serverError={editErrorMessage}
              onCancel={onCancelEdit}
              onSubmit={onSubmitEdit}
            />
          ) : (
            <HabitCard
              habit={habit}
              isDeleting={deletingHabitId === habit.id}
              isMutating={isMutating}
              onCancelDelete={onCancelDelete}
              onDelete={onDelete}
              onEdit={onEdit}
              onRequestDelete={onRequestDelete}
              onStatusChange={onStatusChange}
            />
          )}
        </div>
      ))}
    </div>
  );
}

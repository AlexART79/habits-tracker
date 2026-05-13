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
  archivingHabitId: string | null;
  deletingHabitId: string | null;
  editingHabit: HabitResponse | null;
  editErrorMessage: string | null;
  errorMessage: string | null;
  habits: HabitResponse[];
  isLoading: boolean;
  isMutating: boolean;
  onCancelArchive: () => void;
  onCancelDelete: () => void;
  onCancelEdit: () => void;
  onCheckIn: (habit: HabitResponse) => Promise<void>;
  onDelete: (habit: HabitResponse) => Promise<void>;
  onEdit: (habit: HabitResponse) => void;
  onRequestArchive: (habit: HabitResponse) => void;
  onRequestDelete: (habit: HabitResponse) => void;
  onSubmitEdit: (request: CreateHabitRequest | UpdateHabitRequest) => Promise<void>;
  onStatusChange: (habit: HabitResponse, status: HabitStatus) => Promise<void>;
  onUndoCheckIn: (habit: HabitResponse) => Promise<void>;
};

export function HabitList({
  archivingHabitId,
  deletingHabitId,
  editingHabit,
  editErrorMessage,
  errorMessage,
  habits,
  isLoading,
  isMutating,
  onCancelArchive,
  onCancelDelete,
  onCancelEdit,
  onCheckIn,
  onDelete,
  onEdit,
  onRequestArchive,
  onRequestDelete,
  onSubmitEdit,
  onStatusChange,
  onUndoCheckIn,
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
              isArchiving={archivingHabitId === habit.id}
              isDeleting={deletingHabitId === habit.id}
              isMutating={isMutating}
              onCancelArchive={onCancelArchive}
              onCancelDelete={onCancelDelete}
              onCheckIn={onCheckIn}
              onDelete={onDelete}
              onEdit={onEdit}
              onRequestArchive={onRequestArchive}
              onRequestDelete={onRequestDelete}
              onStatusChange={onStatusChange}
              onUndoCheckIn={onUndoCheckIn}
            />
          )}
        </div>
      ))}
    </div>
  );
}

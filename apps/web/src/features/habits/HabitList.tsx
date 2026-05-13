import type {
  CreateHabitRequest,
  HabitResponse,
  HabitStatus,
  UpdateHabitRequest,
} from '@habit-tracker/shared';
import { Alert } from '../../components/Alert';
import { HabitCard } from './HabitCard';
import { HabitForm } from './HabitForm';
import { HABIT_ARIA } from './habitConstants';
import { HabitListEmptyState } from './HabitListEmptyState';
import { HabitListLoadingState } from './HabitListLoadingState';

type HabitListProps = {
  archivingHabitId: string | null;
  deletingHabitId: string | null;
  editingHabit: HabitResponse | null;
  editErrorMessage: string | null;
  errorMessage: string | null;
  hasActiveFilters: boolean;
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
  hasActiveFilters,
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
    return <HabitListLoadingState />;
  }

  if (errorMessage) {
    return <Alert>{errorMessage}</Alert>;
  }

  if (habits.length === 0) {
    return <HabitListEmptyState hasActiveFilters={hasActiveFilters} />;
  }

  return (
    <div className="grid gap-4" role="list" aria-label={HABIT_ARIA.list}>
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

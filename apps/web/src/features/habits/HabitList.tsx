import type { HabitResponse, HabitStatus } from '@habit-tracker/shared';
import { ListPlus } from 'lucide-react';
import { Alert } from '../../components/Alert';
import { EmptyState } from '../../components/EmptyState';
import { HabitCard } from './HabitCard';

type HabitListProps = {
  deletingHabitId: string | null;
  errorMessage: string | null;
  habits: HabitResponse[];
  isLoading: boolean;
  isMutating: boolean;
  onCancelDelete: () => void;
  onDelete: (habit: HabitResponse) => Promise<void>;
  onEdit: (habit: HabitResponse) => void;
  onRequestDelete: (habit: HabitResponse) => void;
  onStatusChange: (habit: HabitResponse, status: HabitStatus) => Promise<void>;
};

export function HabitList({
  deletingHabitId,
  errorMessage,
  habits,
  isLoading,
  isMutating,
  onCancelDelete,
  onDelete,
  onEdit,
  onRequestDelete,
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
    <div className="grid gap-4">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          isDeleting={deletingHabitId === habit.id}
          isMutating={isMutating}
          onCancelDelete={onCancelDelete}
          onDelete={onDelete}
          onEdit={onEdit}
          onRequestDelete={onRequestDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}

import type { HabitResponse, HabitStatus } from '@habit-tracker/shared';
import { HabitCard } from './HabitCard';

type HabitListProps = {
  deletingHabitId: string | null;
  errorMessage: string | null;
  habits: HabitResponse[];
  isLoading: boolean;
  isMutating: boolean;
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
  onDelete,
  onEdit,
  onRequestDelete,
  onStatusChange,
}: HabitListProps): JSX.Element {
  if (isLoading) {
    return (
      <p role="status" className="font-bold text-slate-700">
        Loading habits...
      </p>
    );
  }

  if (errorMessage) {
    return (
      <p role="alert" className="font-medium text-red-700">
        {errorMessage}
      </p>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-950">No habits yet.</h2>
        <p className="mt-2 text-slate-700">
          Create your first habit to start tracking progress.
        </p>
      </div>
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
          onDelete={onDelete}
          onEdit={onEdit}
          onRequestDelete={onRequestDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}

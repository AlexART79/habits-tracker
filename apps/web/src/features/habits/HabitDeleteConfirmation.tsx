import type { HabitResponse } from '@habit-tracker/shared';
import { Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { HABIT_ARIA, HABIT_COPY } from './habitConstants';

type HabitDeleteConfirmationProps = {
  habit: HabitResponse;
  isMutating: boolean;
  onCancel: () => void;
  onDelete: (habit: HabitResponse) => Promise<void>;
};

export function HabitDeleteConfirmation({
  habit,
  isMutating,
  onCancel,
  onDelete,
}: HabitDeleteConfirmationProps): JSX.Element {
  return (
    <div className="grid gap-3 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-500/40 dark:bg-red-500/10 sm:grid-cols-[1fr_auto] sm:items-center">
      <p className="font-medium text-red-800 dark:text-red-200">
        Are you sure you want to delete {habit.name}?
      </p>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isMutating}>
          {HABIT_COPY.cancel}
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={() => void onDelete(habit)}
          disabled={isMutating}
          aria-label={HABIT_ARIA.confirmDelete(habit.name)}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {HABIT_COPY.confirmDelete}
        </Button>
      </div>
    </div>
  );
}

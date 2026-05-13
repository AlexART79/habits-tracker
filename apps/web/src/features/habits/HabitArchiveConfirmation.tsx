import type { HabitResponse, HabitStatus } from '@habit-tracker/shared';
import { Archive } from 'lucide-react';
import { Button } from '../../components/Button';
import { HABIT_ARIA, HABIT_COPY } from './habitConstants';

type HabitArchiveConfirmationProps = {
  habit: HabitResponse;
  isMutating: boolean;
  onCancel: () => void;
  onStatusChange: (habit: HabitResponse, status: HabitStatus) => Promise<void>;
};

export function HabitArchiveConfirmation({
  habit,
  isMutating,
  onCancel,
  onStatusChange,
}: HabitArchiveConfirmationProps): JSX.Element {
  return (
    <div className="grid gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/40 dark:bg-amber-500/10 sm:grid-cols-[1fr_auto] sm:items-center">
      <p className="font-medium text-amber-900 dark:text-amber-100">
        Archiving {habit.name} is irreversible and will make it read-only.
      </p>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isMutating}
          aria-label={HABIT_ARIA.cancelArchive(habit.name)}
        >
          {HABIT_COPY.cancel}
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={() => void onStatusChange(habit, 'ARCHIVED')}
          disabled={isMutating}
          aria-label={HABIT_ARIA.confirmArchive(habit.name)}
        >
          <Archive className="h-4 w-4" aria-hidden="true" />
          {HABIT_COPY.confirmArchive}
        </Button>
      </div>
    </div>
  );
}

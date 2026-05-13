import type { HabitResponse } from '@habit-tracker/shared';
import { CalendarCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '../../components/Button';
import { HABIT_ARIA, HABIT_COPY } from './habitConstants';

type HabitCheckInActionsProps = {
  habit: HabitResponse;
  isMutating: boolean;
  onCheckIn: (habit: HabitResponse) => Promise<void>;
  onUndoCheckIn: (habit: HabitResponse) => Promise<void>;
};

export function HabitCheckInActions({
  habit,
  isMutating,
  onCheckIn,
  onUndoCheckIn,
}: HabitCheckInActionsProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {habit.status === 'ACTIVE' ? (
        habit.completedToday ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => void onUndoCheckIn(habit)}
            disabled={isMutating}
            aria-label={HABIT_ARIA.undoCheckIn(habit.name)}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {HABIT_COPY.undoToday}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => void onCheckIn(habit)}
            disabled={isMutating}
            aria-label={HABIT_ARIA.checkIn(habit.name)}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {HABIT_COPY.checkInToday}
          </Button>
        )
      ) : (
        <p className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          {habit.status === 'PAUSED'
            ? HABIT_COPY.pausedCannotCheckIn
            : HABIT_COPY.archivedCannotCheckIn}
        </p>
      )}
    </div>
  );
}

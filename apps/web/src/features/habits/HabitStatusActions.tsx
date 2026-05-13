import type { HabitResponse, HabitStatus } from '@habit-tracker/shared';
import { Archive, Pause, Pencil, Play, Trash2 } from 'lucide-react';
import { IconButton } from '../../components/IconButton';
import { HABIT_ARIA } from './habitConstants';

type HabitStatusActionsProps = {
  habit: HabitResponse;
  isMutating: boolean;
  onEdit: (habit: HabitResponse) => void;
  onRequestArchive: (habit: HabitResponse) => void;
  onRequestDelete: (habit: HabitResponse) => void;
  onStatusChange: (habit: HabitResponse, status: HabitStatus) => Promise<void>;
};

export function HabitStatusActions({
  habit,
  isMutating,
  onEdit,
  onRequestArchive,
  onRequestDelete,
  onStatusChange,
}: HabitStatusActionsProps): JSX.Element {
  return (
    <div className="flex flex-wrap gap-2">
      {habit.status !== 'ARCHIVED' ? (
        <>
          <IconButton
            type="button"
            variant="secondary"
            onClick={() => onEdit(habit)}
            disabled={isMutating}
            aria-label={HABIT_ARIA.edit(habit.name)}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </IconButton>
          {habit.status === 'ACTIVE' ? (
            <IconButton
              type="button"
              variant="secondary"
              onClick={() => void onStatusChange(habit, 'PAUSED')}
              disabled={isMutating}
              aria-label={HABIT_ARIA.pause(habit.name)}
            >
              <Pause className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          ) : (
            <IconButton
              type="button"
              variant="secondary"
              onClick={() => void onStatusChange(habit, 'ACTIVE')}
              disabled={isMutating}
              aria-label={HABIT_ARIA.resume(habit.name)}
            >
              <Play className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          )}
          <IconButton
            type="button"
            variant="secondary"
            onClick={() => onRequestArchive(habit)}
            disabled={isMutating}
            aria-label={HABIT_ARIA.archive(habit.name)}
          >
            <Archive className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </>
      ) : null}
      <IconButton
        type="button"
        variant="secondary"
        onClick={() => onRequestDelete(habit)}
        disabled={isMutating}
        aria-label={HABIT_ARIA.delete(habit.name)}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </IconButton>
    </div>
  );
}

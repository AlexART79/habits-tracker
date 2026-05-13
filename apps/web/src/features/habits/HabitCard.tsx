import type { HabitResponse, HabitStatus } from '@habit-tracker/shared';
import { Archive, CalendarDays, Pencil, Play, Pause, Trash2 } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

type HabitCardProps = {
  habit: HabitResponse;
  isDeleting: boolean;
  isMutating: boolean;
  onDelete: (habit: HabitResponse) => Promise<void>;
  onEdit: (habit: HabitResponse) => void;
  onRequestDelete: (habit: HabitResponse) => void;
  onStatusChange: (habit: HabitResponse, status: HabitStatus) => Promise<void>;
};

export function HabitCard({
  habit,
  isDeleting,
  isMutating,
  onDelete,
  onEdit,
  onRequestDelete,
  onStatusChange,
}: HabitCardProps): JSX.Element {
  const isArchived = habit.status === 'ARCHIVED';
  const statusTone =
    habit.status === 'ACTIVE' ? 'success' : habit.status === 'PAUSED' ? 'warning' : 'neutral';

  return (
    <Card className="grid gap-4 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-950 dark:text-white">{habit.name}</h3>
          {habit.description ? (
            <p className="mt-1 text-slate-700 dark:text-slate-300">{habit.description}</p>
          ) : null}
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Starts {habit.startDate}
          </p>
        </div>
        <Badge tone={statusTone}>{habit.status}</Badge>
      </div>

      {isArchived ? (
        <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Archived habits are read-only.
        </p>
      ) : null}

      {isDeleting ? (
        <div className="grid gap-3 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-500/40 dark:bg-red-500/10 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className="font-medium text-red-800 dark:text-red-200">
            Are you sure you want to delete {habit.name}?
          </p>
          <Button
            type="button"
            variant="danger"
            onClick={() => void onDelete(habit)}
            disabled={isMutating}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Confirm delete {habit.name}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {!isArchived ? (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onEdit(habit)}
              disabled={isMutating}
              aria-label={`Edit ${habit.name}`}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit
            </Button>
            {habit.status === 'ACTIVE' ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => void onStatusChange(habit, 'PAUSED')}
                disabled={isMutating}
                aria-label={`Pause ${habit.name}`}
              >
                <Pause className="h-4 w-4" aria-hidden="true" />
                Pause
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={() => void onStatusChange(habit, 'ACTIVE')}
                disabled={isMutating}
                aria-label={`Resume ${habit.name}`}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Resume
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => void onStatusChange(habit, 'ARCHIVED')}
              disabled={isMutating}
              aria-label={`Archive ${habit.name}`}
            >
              <Archive className="h-4 w-4" aria-hidden="true" />
              Archive
            </Button>
          </>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          onClick={() => onRequestDelete(habit)}
        disabled={isMutating}
        aria-label={`Delete ${habit.name}`}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete
      </Button>
      </div>
    </Card>
  );
}

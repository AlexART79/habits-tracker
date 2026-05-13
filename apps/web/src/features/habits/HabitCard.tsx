import type { HabitResponse, HabitStatus } from '@habit-tracker/shared';
import {
  Archive,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Pencil,
  Play,
  Pause,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { IconButton } from '../../components/IconButton';
import { CheckInHistory } from './CheckInHistory';

type HabitCardProps = {
  habit: HabitResponse;
  isArchiving: boolean;
  isDeleting: boolean;
  isMutating: boolean;
  onCancelArchive: () => void;
  onCancelDelete: () => void;
  onCheckIn: (habit: HabitResponse) => Promise<void>;
  onDelete: (habit: HabitResponse) => Promise<void>;
  onEdit: (habit: HabitResponse) => void;
  onRequestArchive: (habit: HabitResponse) => void;
  onRequestDelete: (habit: HabitResponse) => void;
  onStatusChange: (habit: HabitResponse, status: HabitStatus) => Promise<void>;
  onUndoCheckIn: (habit: HabitResponse) => Promise<void>;
};

export function HabitCard({
  habit,
  isArchiving,
  isDeleting,
  isMutating,
  onCancelArchive,
  onCancelDelete,
  onCheckIn,
  onDelete,
  onEdit,
  onRequestArchive,
  onRequestDelete,
  onStatusChange,
  onUndoCheckIn,
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

      <div className="grid gap-3 sm:grid-cols-3" aria-label={`${habit.name} streak summary`}>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Current streak</p>
          <p className="text-2xl font-bold text-slate-950 dark:text-white">{habit.currentStreak}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Best streak</p>
          <p className="text-2xl font-bold text-slate-950 dark:text-white">{habit.bestStreak}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total check-ins</p>
          <p className="text-2xl font-bold text-slate-950 dark:text-white">{habit.totalCheckIns}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {habit.status === 'ACTIVE' ? (
          habit.completedToday ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => void onUndoCheckIn(habit)}
              disabled={isMutating}
              aria-label={`Undo check-in ${habit.name}`}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Undo today
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void onCheckIn(habit)}
              disabled={isMutating}
              aria-label={`Check in ${habit.name}`}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Check in today
            </Button>
          )
        ) : (
          <p className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            {habit.status === 'PAUSED'
              ? 'Paused habits cannot be checked in.'
              : 'Archived habits cannot be checked in.'}
          </p>
        )}
      </div>

      {isArchiving ? (
        <div className="grid gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/40 dark:bg-amber-500/10 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className="font-medium text-amber-900 dark:text-amber-100">
            Archiving {habit.name} is irreversible and will make it read-only.
          </p>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancelArchive}
              disabled={isMutating}
              aria-label={`Cancel archive ${habit.name}`}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => void onStatusChange(habit, 'ARCHIVED')}
              disabled={isMutating}
              aria-label={`Confirm archive ${habit.name}`}
            >
              <Archive className="h-4 w-4" aria-hidden="true" />
              Confirm archive
            </Button>
          </div>
        </div>
      ) : null}

      {isDeleting ? (
        <div className="grid gap-3 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-500/40 dark:bg-red-500/10 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className="font-medium text-red-800 dark:text-red-200">
            Are you sure you want to delete {habit.name}?
          </p>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancelDelete}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => void onDelete(habit)}
              disabled={isMutating}
              aria-label={`Confirm delete ${habit.name}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Confirm delete
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {!isArchived ? (
          <>
            <IconButton
              type="button"
              variant="secondary"
              onClick={() => onEdit(habit)}
              disabled={isMutating}
              aria-label={`Edit ${habit.name}`}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </IconButton>
            {habit.status === 'ACTIVE' ? (
              <IconButton
                type="button"
                variant="secondary"
                onClick={() => void onStatusChange(habit, 'PAUSED')}
                disabled={isMutating}
                aria-label={`Pause ${habit.name}`}
              >
                <Pause className="h-4 w-4" aria-hidden="true" />
              </IconButton>
            ) : (
              <IconButton
                type="button"
                variant="secondary"
                onClick={() => void onStatusChange(habit, 'ACTIVE')}
                disabled={isMutating}
                aria-label={`Resume ${habit.name}`}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
              </IconButton>
            )}
            <IconButton
              type="button"
              variant="secondary"
              onClick={() => onRequestArchive(habit)}
              disabled={isMutating}
              aria-label={`Archive ${habit.name}`}
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
          aria-label={`Delete ${habit.name}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      </div>

      <CheckInHistory habitId={habit.id} habitName={habit.name} />
    </Card>
  );
}

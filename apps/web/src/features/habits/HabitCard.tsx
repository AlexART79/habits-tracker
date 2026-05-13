import type { HabitResponse, HabitStatus } from '@habit-tracker/shared';
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

  return (
    <Card className="grid gap-4 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-950">{habit.name}</h3>
          {habit.description ? (
            <p className="mt-1 text-slate-700">{habit.description}</p>
          ) : null}
          <p className="mt-2 text-sm font-medium text-slate-600">
            Starts {habit.startDate}
          </p>
        </div>
        <span className="w-fit rounded-full border border-slate-300 px-3 py-1 text-sm font-bold text-slate-800">
          {habit.status}
        </span>
      </div>

      {isArchived ? (
        <p className="font-medium text-slate-700">Archived habits are read-only.</p>
      ) : null}

      {isDeleting ? (
        <div className="grid gap-3 rounded-md border border-red-200 bg-red-50 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className="font-medium text-red-800">
            Are you sure you want to delete {habit.name}?
          </p>
          <Button
            type="button"
            onClick={() => void onDelete(habit)}
            disabled={isMutating}
          >
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
          Delete
        </Button>
      </div>
    </Card>
  );
}

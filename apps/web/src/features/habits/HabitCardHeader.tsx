import type { HabitResponse } from '@habit-tracker/shared';
import { CalendarDays } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { getStatusTone } from './habitUtils';

type HabitCardHeaderProps = {
  habit: HabitResponse;
};

export function HabitCardHeader({ habit }: HabitCardHeaderProps): JSX.Element {
  return (
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
      <Badge tone={getStatusTone(habit.status)}>{habit.status}</Badge>
    </div>
  );
}

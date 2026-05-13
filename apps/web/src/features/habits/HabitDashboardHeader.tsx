import { CirclePlus } from 'lucide-react';
import { Button } from '../../components/Button';
import { HABIT_COPY } from './habitConstants';

type HabitDashboardHeaderProps = {
  onCreate: () => void;
};

export function HabitDashboardHeader({ onCreate }: HabitDashboardHeaderProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {HABIT_COPY.dashboardEyebrow}
        </p>
        <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
          {HABIT_COPY.dashboardTitle}
        </h2>
        <p className="mt-1 text-slate-700 dark:text-slate-300">
          {HABIT_COPY.dashboardDescription}
        </p>
      </div>
      <Button type="button" onClick={onCreate}>
        <CirclePlus className="h-4 w-4" aria-hidden="true" />
        {HABIT_COPY.createHabit}
      </Button>
    </div>
  );
}

import { HABIT_COPY } from './habitConstants';

export function HabitArchivedNotice(): JSX.Element {
  return (
    <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
      {HABIT_COPY.archivedReadOnly}
    </p>
  );
}

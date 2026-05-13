import { HABIT_COPY } from './habitConstants';

export function HabitListLoadingState(): JSX.Element {
  return (
    <p
      role="status"
      className="rounded-lg border border-slate-200 bg-white/80 px-4 py-3 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200"
    >
      {HABIT_COPY.loadingHabits}
    </p>
  );
}

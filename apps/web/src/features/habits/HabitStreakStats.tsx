import type { HabitResponse } from '@habit-tracker/shared';
import { HABIT_ARIA, HABIT_COPY } from './habitConstants';

type HabitStreakStatsProps = {
  habit: HabitResponse;
};

export function HabitStreakStats({ habit }: HabitStreakStatsProps): JSX.Element {
  return (
    <div className="grid gap-3 sm:grid-cols-3" aria-label={HABIT_ARIA.streakSummary(habit.name)}>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {HABIT_COPY.currentStreak}
        </p>
        <p className="text-2xl font-bold text-slate-950 dark:text-white">{habit.currentStreak}</p>
      </div>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {HABIT_COPY.bestStreak}
        </p>
        <p className="text-2xl font-bold text-slate-950 dark:text-white">{habit.bestStreak}</p>
      </div>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {HABIT_COPY.totalCheckIns}
        </p>
        <p className="text-2xl font-bold text-slate-950 dark:text-white">
          {habit.totalCheckIns}
        </p>
      </div>
    </div>
  );
}

import { Activity, Archive, CirclePause, ListChecks } from 'lucide-react';
import { StatTile } from '../../components/StatTile';
import { HABIT_COPY } from './habitConstants';
import type { HabitStats } from './habitTypes';

type HabitStatsBarProps = {
  stats: HabitStats;
};

export function HabitStatsBar({ stats }: HabitStatsBarProps): JSX.Element {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile icon={ListChecks} label={HABIT_COPY.totalHabits} value={stats.total} />
      <StatTile icon={Activity} label={HABIT_COPY.active} value={stats.active} />
      <StatTile icon={CirclePause} label={HABIT_COPY.paused} value={stats.paused} />
      <StatTile icon={Archive} label={HABIT_COPY.archived} value={stats.archived} />
    </div>
  );
}

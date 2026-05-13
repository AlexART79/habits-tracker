import { ListPlus } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { HABIT_COPY } from './habitConstants';

type HabitListEmptyStateProps = {
  hasActiveFilters: boolean;
};

export function HabitListEmptyState({
  hasActiveFilters,
}: HabitListEmptyStateProps): JSX.Element {
  if (hasActiveFilters) {
    return (
      <EmptyState icon={ListPlus} title={HABIT_COPY.noFilterMatchesTitle}>
        {HABIT_COPY.noFilterMatchesDescription}
      </EmptyState>
    );
  }

  return (
    <EmptyState icon={ListPlus} title={HABIT_COPY.noHabitsTitle}>
      {HABIT_COPY.noHabitsDescription}
    </EmptyState>
  );
}

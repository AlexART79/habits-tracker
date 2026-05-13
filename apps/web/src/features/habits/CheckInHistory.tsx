import { CalendarCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../components/Button';
import { CheckInHistoryPanel } from './CheckInHistoryPanel';
import { HABIT_ARIA, HABIT_COPY } from './habitConstants';
import { useCheckInHistory } from './useCheckInHistory';

type CheckInHistoryProps = {
  habitId: string;
  habitName: string;
};

export function CheckInHistory({
  habitId,
  habitName,
}: CheckInHistoryProps): JSX.Element {
  const history = useCheckInHistory(habitId);

  return (
    <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
      <Button
        type="button"
        variant="ghost"
        className="justify-between px-2"
        onClick={() => void history.toggleHistory()}
        aria-expanded={history.isExpanded}
        aria-label={
          history.isExpanded
            ? HABIT_ARIA.hideHistory(habitName)
            : HABIT_ARIA.showHistory(habitName)
        }
      >
        <span className="inline-flex items-center gap-2">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          {HABIT_COPY.currentMonthHistory}
        </span>
        {history.isExpanded ? (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>

      {history.isExpanded ? (
        <CheckInHistoryPanel
          checkIns={history.checkIns}
          errorMessage={history.errorMessage}
          habitName={habitName}
          isLoading={history.isLoading}
        />
      ) : null}
    </div>
  );
}

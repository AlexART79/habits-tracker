import type { CheckInResponse } from '@habit-tracker/shared';
import { Alert } from '../../components/Alert';
import { HABIT_ARIA, HABIT_COPY } from './habitConstants';

type CheckInHistoryPanelProps = {
  checkIns: CheckInResponse[] | null;
  errorMessage: string | null;
  habitName: string;
  isLoading: boolean;
};

export function CheckInHistoryPanel({
  checkIns,
  errorMessage,
  habitName,
  isLoading,
}: CheckInHistoryPanelProps): JSX.Element {
  return (
    <div className="grid gap-2" aria-label={HABIT_ARIA.currentMonthCheckIns(habitName)}>
      {isLoading ? (
        <p role="status" className="font-medium text-slate-700 dark:text-slate-300">
          {HABIT_COPY.loadingCheckIns}
        </p>
      ) : null}
      {errorMessage ? <Alert>{errorMessage}</Alert> : null}
      {!isLoading && !errorMessage && checkIns?.length === 0 ? (
        <p className="font-medium text-slate-700 dark:text-slate-300">
          {HABIT_COPY.noCheckInsThisMonth}
        </p>
      ) : null}
      {!isLoading && !errorMessage && checkIns && checkIns.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label={HABIT_COPY.checkedInDates}>
          {checkIns.map((checkIn) => (
            <li
              key={checkIn.id}
              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 font-bold text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100"
            >
              {checkIn.date}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

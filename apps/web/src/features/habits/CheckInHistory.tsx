import { useState } from 'react';
import type { CheckInResponse } from '@habit-tracker/shared';
import { CalendarCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { listCheckIns } from '../../lib/apiClient';

type CheckInHistoryProps = {
  habitId: string;
  habitName: string;
};

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function CheckInHistory({
  habitId,
  habitName,
}: CheckInHistoryProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkIns, setCheckIns] = useState<CheckInResponse[] | null>(null);

  async function toggleHistory(): Promise<void> {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    setIsExpanded(true);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await listCheckIns(habitId, getCurrentMonth());
      setCheckIns(response.checkIns);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load check-ins.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
      <Button
        type="button"
        variant="ghost"
        className="justify-between px-2"
        onClick={() => void toggleHistory()}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Hide' : 'Show'} check-in history for ${habitName}`}
      >
        <span className="inline-flex items-center gap-2">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          Current month history
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>

      {isExpanded ? (
        <div className="grid gap-2" aria-label={`${habitName} current month check-ins`}>
          {isLoading ? (
            <p role="status" className="font-medium text-slate-700 dark:text-slate-300">
              Loading check-ins...
            </p>
          ) : null}
          {errorMessage ? <Alert>{errorMessage}</Alert> : null}
          {!isLoading && !errorMessage && checkIns?.length === 0 ? (
            <p className="font-medium text-slate-700 dark:text-slate-300">
              No check-ins this month.
            </p>
          ) : null}
          {!isLoading && !errorMessage && checkIns && checkIns.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label="Checked-in dates">
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
      ) : null}
    </div>
  );
}

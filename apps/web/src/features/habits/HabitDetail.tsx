import { useState, useEffect, useCallback } from 'react';
import type { HabitWithStats } from './types';
import { fetchCheckIns } from './habitsApi';
import { HabitStatCard } from './HabitStatCard';
import { STATUS_BADGE_CLASSES, WEEKDAYS, MODAL_BACKDROP_CLASSES } from './constants';
import { parseYYYYMM, buildCalendarDays, shiftMonth, monthLabel } from './calendarUtils';

interface HabitDetailProps {
  habit: HabitWithStats;
  onClose: () => void;
}

export function HabitDetail({ habit, onClose }: HabitDetailProps) {
  const today = new Date().toISOString().split('T')[0];
  const [currentMonth, setCurrentMonth] = useState(() => today.slice(0, 7));
  const [checkedDates, setCheckedDates] = useState<Set<string>>(new Set());
  const [loadingDates, setLoadingDates] = useState(false);

  const loadDates = useCallback(
    (month: string) => {
      setLoadingDates(true);
      fetchCheckIns(habit.id, month)
        .then(({ dates }) => setCheckedDates(new Set(dates)))
        .catch(() => setCheckedDates(new Set()))
        .finally(() => setLoadingDates(false));
    },
    [habit.id],
  );

  useEffect(() => {
    loadDates(currentMonth);
  }, [currentMonth, loadDates]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { year, month } = parseYYYYMM(currentMonth);
  const cells = buildCalendarDays(year, month);

  return (
    <div
      className={MODAL_BACKDROP_CLASSES}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 p-5 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <h2 id="detail-title" className="text-lg font-semibold text-gray-900 truncate">
              {habit.name}
            </h2>
            {habit.description && (
              <p className="text-sm text-gray-500 mt-0.5">{habit.description}</p>
            )}
          </div>
          <span
            className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE_CLASSES[habit.status]}`}
          >
            {habit.status}
          </span>
        </div>

        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex gap-6 text-sm">
            <HabitStatCard value={habit.currentStreak} label="Current streak" />
            <HabitStatCard value={habit.bestStreak} label="Best streak" />
            <HabitStatCard value={habit.totalCheckIns} label="Total check-ins" />
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              aria-label="Previous month"
              onClick={() => setCurrentMonth((m) => shiftMonth(m, -1))}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 transition-colors"
            >
              &#8249;
            </button>
            <p className="text-sm font-medium text-gray-700">{monthLabel(currentMonth)}</p>
            <button
              aria-label="Next month"
              onClick={() => setCurrentMonth((m) => shiftMonth(m, 1))}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 transition-colors"
            >
              &#8250;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          {loadingDates ? (
            <div className="h-32 flex items-center justify-center text-sm text-gray-400">
              Loading…
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {cells.map((date, i) => {
                if (!date) return <div key={`empty-${i}`} />;
                const checked = checkedDates.has(date);
                const isToday = date === today;
                return (
                  <div
                    key={date}
                    title={date}
                    className={[
                      'aspect-square flex items-center justify-center rounded-full text-xs font-medium',
                      checked
                        ? 'bg-blue-500 text-white'
                        : isToday
                          ? 'ring-2 ring-blue-400 text-gray-700'
                          : 'text-gray-600 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {new Date(date + 'T00:00:00').getDate()}
                  </div>
                );
              })}
            </div>
          )}

          {!loadingDates && checkedDates.size === 0 && (
            <p className="text-center text-sm text-gray-400 mt-3">No check-ins this month</p>
          )}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

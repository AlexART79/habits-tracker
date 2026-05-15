import { useState } from 'react';
import { Card } from '../../components/Card';
import { IconBtn } from '../../components/IconBtn';
import {
  IconEdit,
  IconPause,
  IconResume,
  IconArchive,
  IconDelete,
  IconDetail,
} from '../../components/icons';
import { STATUS_BADGE_CLASSES } from './constants';
import type { HabitWithStats, HabitStatus } from './types';

interface HabitCardProps {
  habit: HabitWithStats;
  onEdit: (habit: HabitWithStats) => void;
  onDelete: (habit: HabitWithStats) => void;
  onArchive: (habit: HabitWithStats) => void;
  onStatusChange: (habit: HabitWithStats, status: HabitStatus) => void;
  onCheckIn: (habit: HabitWithStats) => Promise<void>;
  onUndoCheckIn: (habit: HabitWithStats) => Promise<void>;
  onViewDetail: (habit: HabitWithStats) => void;
}

export function HabitCard({
  habit,
  onEdit,
  onDelete,
  onArchive,
  onStatusChange,
  onCheckIn,
  onUndoCheckIn,
  onViewDetail,
}: HabitCardProps) {
  const [busy, setBusy] = useState(false);
  const isArchived = habit.status === 'ARCHIVED';
  const isActive = habit.status === 'ACTIVE';

  async function handleCheckIn() {
    setBusy(true);
    try {
      await onCheckIn(habit);
    } finally {
      setBusy(false);
    }
  }

  async function handleUndo() {
    setBusy(true);
    try {
      await onUndoCheckIn(habit);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="flex flex-col">
      {/* Top section — grows to push buttons to the bottom */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">{habit.name}</h3>
            {habit.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{habit.description}</p>
            )}
          </div>
          <span
            className={`shrink-0 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE_CLASSES[habit.status]}`}
          >
            {habit.status}
          </span>
        </div>

        <p className="text-xs text-gray-400">
          Started {new Date(habit.startDate).toLocaleDateString()}
        </p>

        <div className="flex items-center gap-3 text-xs text-gray-500 border-t border-gray-100 pt-2">
          <span title="Current streak">
            Streak: <span className="font-medium text-gray-700">{habit.currentStreak}</span>
          </span>
          <span title="Best streak">
            Best: <span className="font-medium text-gray-700">{habit.bestStreak}</span>
          </span>
          <span title="Total check-ins">
            Total: <span className="font-medium text-gray-700">{habit.totalCheckIns}</span>
          </span>
        </div>
      </div>

      {/* Bottom section — always at the bottom */}
      <div className="flex flex-col gap-2 pt-4">
        {!isArchived && (
          isActive && habit.completedToday ? (
            <button
              aria-label="Undo check-in"
              onClick={handleUndo}
              disabled={busy}
              className="w-full text-sm font-medium py-1.5 px-3 rounded border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? 'Saving…' : 'Done today — Undo'}
            </button>
          ) : (
            <button
              aria-label="Check in"
              onClick={handleCheckIn}
              disabled={busy || !isActive}
              className="w-full text-sm font-medium py-1.5 px-3 rounded border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? 'Saving…' : 'Check In'}
            </button>
          )
        )}

        <div className="flex gap-1.5">
          <IconBtn title="View details" onClick={() => onViewDetail(habit)}>
            <IconDetail />
          </IconBtn>
          {!isArchived && (
            <>
              <IconBtn title="Edit" onClick={() => onEdit(habit)}>
                <IconEdit />
              </IconBtn>
              {habit.status === 'ACTIVE' && (
                <IconBtn title="Pause" onClick={() => onStatusChange(habit, 'PAUSED')}>
                  <IconPause />
                </IconBtn>
              )}
              {habit.status === 'PAUSED' && (
                <IconBtn title="Resume" onClick={() => onStatusChange(habit, 'ACTIVE')}>
                  <IconResume />
                </IconBtn>
              )}
              <IconBtn title="Archive" onClick={() => onArchive(habit)}>
                <IconArchive />
              </IconBtn>
            </>
          )}
          <IconBtn
            title="Delete"
            onClick={() => onDelete(habit)}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <IconDelete />
          </IconBtn>
        </div>
      </div>
    </Card>
  );
}

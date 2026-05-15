import React, { useState } from 'react';
import { Card } from '../../components/Card';
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

const statusBadge: Record<HabitStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
};

function IconBtn({
  title,
  onClick,
  disabled,
  className = '',
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 1.5l3 3L4 13H1v-3L9.5 1.5z" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="2.5" y="2" width="3" height="10" rx="1" />
      <rect x="8.5" y="2" width="3" height="10" rx="1" />
    </svg>
  );
}

function IconResume() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M3 2.5l9 4.5-9 4.5V2.5z" />
    </svg>
  );
}

function IconArchive() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2" width="12" height="3" rx="0.5" />
      <path d="M2 5v6a1 1 0 001 1h8a1 1 0 001-1V5" />
      <path d="M5.5 8h3M7 6.5v3" />
    </svg>
  );
}

function IconDelete() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4h10M5 4V2.5h4V4M11 4l-.8 7.5a1 1 0 01-1 .9H4.8a1 1 0 01-1-.9L3 4" />
    </svg>
  );
}

function IconDetail() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="5.5" />
      <path d="M7 6v4M7 4.5v.5" />
    </svg>
  );
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
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">{habit.name}</h3>
          {habit.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{habit.description}</p>
          )}
        </div>
        <span
          className={`shrink-0 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[habit.status]}`}
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

      {!isArchived && (
        <div className="pt-1">
          {isActive && habit.completedToday ? (
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
          )}
        </div>
      )}

      <div className="flex gap-1.5 pt-1">
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
    </Card>
  );
}

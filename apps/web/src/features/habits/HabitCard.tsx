import React from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import type { Habit, HabitStatus } from './types';

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  onStatusChange: (habit: Habit, status: HabitStatus) => void;
}

const statusBadge: Record<HabitStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
};

export function HabitCard({ habit, onEdit, onDelete, onStatusChange }: HabitCardProps) {
  const isArchived = habit.status === 'ARCHIVED';

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

      <div className="flex flex-wrap gap-2 pt-1">
        {!isArchived && (
          <>
            <Button variant="secondary" onClick={() => onEdit(habit)}>
              Edit
            </Button>
            {habit.status === 'ACTIVE' && (
              <Button variant="secondary" onClick={() => onStatusChange(habit, 'PAUSED')}>
                Pause
              </Button>
            )}
            {habit.status === 'PAUSED' && (
              <Button variant="secondary" onClick={() => onStatusChange(habit, 'ACTIVE')}>
                Resume
              </Button>
            )}
            <Button variant="secondary" onClick={() => onStatusChange(habit, 'ARCHIVED')}>
              Archive
            </Button>
          </>
        )}
        <Button variant="secondary" onClick={() => onDelete(habit)}>
          Delete
        </Button>
      </div>
    </Card>
  );
}

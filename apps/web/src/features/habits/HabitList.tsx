import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { HabitCard } from './HabitCard';
import { HabitModal } from './HabitModal';
import { updateHabit, deleteHabit } from './habitsApi';
import type { Habit, HabitStatus } from './types';

interface HabitListProps {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  onReload: () => void;
  onCreateClick: () => void;
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-3 bg-gray-100 rounded w-1/2 mb-6" />
          <div className="h-3 bg-gray-100 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function HabitList({ habits, loading, error, onReload, onCreateClick }: HabitListProps) {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  async function handleStatusChange(habit: Habit, status: HabitStatus) {
    await updateHabit(habit.id, { status });
    onReload();
  }

  async function handleDelete(habit: Habit) {
    if (!window.confirm(`Delete "${habit.name}"? This cannot be undone.`)) return;
    await deleteHabit(habit.id);
    onReload();
  }

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-4">
        <span>{error}</span>
        <Button variant="secondary" onClick={onReload}>
          Retry
        </Button>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">No habits yet. Create your first habit!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onEdit={setEditingHabit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
      {editingHabit && (
        <HabitModal
          mode="edit"
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSaved={() => {
            setEditingHabit(null);
            onReload();
          }}
        />
      )}
    </>
  );
}

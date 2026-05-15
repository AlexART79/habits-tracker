import React, { useEffect, useId } from 'react';
import { createHabit, updateHabit } from './habitsApi';
import { HabitForm } from './HabitForm';
import type { Habit } from './types';

interface HabitModalProps {
  mode: 'create' | 'edit';
  habit?: Habit;
  onClose: () => void;
  onSaved: () => void;
}

export function HabitModal({ mode, habit, onClose, onSaved }: HabitModalProps) {
  const titleId = useId();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  async function handleSubmit(payload: Parameters<typeof createHabit>[0]) {
    if (mode === 'edit' && habit) {
      await updateHabit(habit.id, payload);
    } else {
      await createHabit(payload as Parameters<typeof createHabit>[0]);
    }
    onSaved();
    onClose();
  }

  const initialValues = habit
    ? { name: habit.name, description: habit.description ?? '', startDate: habit.startDate }
    : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md bg-white rounded-xl shadow-xl p-6"
      >
        <h2 id={titleId} className="text-lg font-semibold text-gray-900 mb-5">
          {mode === 'create' ? 'New habit' : 'Edit habit'}
        </h2>
        <HabitForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel={mode === 'create' ? 'Create habit' : 'Save changes'}
        />
      </div>
    </div>
  );
}

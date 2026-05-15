import { useState } from 'react';
import type { HabitWithStats } from './types';

interface HabitListModalsState {
  editingHabit: HabitWithStats | null;
  detailHabit: HabitWithStats | null;
  openEdit: (habit: HabitWithStats) => void;
  closeEdit: () => void;
  openDetail: (habit: HabitWithStats) => void;
  closeDetail: () => void;
}

export function useHabitListModals(): HabitListModalsState {
  const [editingHabit, setEditingHabit] = useState<HabitWithStats | null>(null);
  const [detailHabit, setDetailHabit] = useState<HabitWithStats | null>(null);

  return {
    editingHabit,
    detailHabit,
    openEdit: setEditingHabit,
    closeEdit: () => setEditingHabit(null),
    openDetail: setDetailHabit,
    closeDetail: () => setDetailHabit(null),
  };
}

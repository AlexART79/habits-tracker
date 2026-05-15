export type HabitStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  startDate: string;
  status: HabitStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitPayload {
  name: string;
  description?: string;
  startDate: string;
}

export interface UpdateHabitPayload {
  name?: string;
  description?: string;
  startDate?: string;
  status?: HabitStatus;
}

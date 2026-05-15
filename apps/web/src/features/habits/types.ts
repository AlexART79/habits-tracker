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

export interface HabitWithStats extends Habit {
  currentStreak: number;
  bestStreak: number;
  totalCheckIns: number;
  completedToday: boolean;
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

export interface CheckInsResponse {
  dates: string[];
}

export interface HabitFilters {
  search?: string;
  status?: HabitStatus | '';
  completedToday?: boolean | null;
}

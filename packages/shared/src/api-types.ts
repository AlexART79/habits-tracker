import type { AuthProvider, HabitStatus } from './constants.js';

export type HealthResponse = {
  status: 'ok';
  service: 'habit-tracker-api';
  timestamp: string;
};

export type AuthUserResponse = {
  id: string;
  provider: AuthProvider;
  providerUserId: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
};

export type AuthMeResponse = {
  user: AuthUserResponse;
};

export type AuthLogoutResponse = {
  ok: true;
};

export type HabitResponse = {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  status: HabitStatus;
  currentStreak: number;
  bestStreak: number;
  totalCheckIns: number;
  completedToday: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HabitListResponse = {
  habits: HabitResponse[];
};

export type CreateHabitRequest = {
  name: string;
  description?: string | null;
  startDate: string;
};

export type UpdateHabitRequest = {
  name?: string;
  description?: string | null;
  startDate?: string;
  status?: HabitStatus;
};

export type DeleteHabitResponse = {
  ok: true;
};

export type CheckInResponse = {
  id: string;
  habitId: string;
  date: string;
  createdAt: string;
};

export type CheckInListResponse = {
  checkIns: CheckInResponse[];
};

export type CheckInTodayResponse = {
  checkIn: CheckInResponse;
  habit: HabitResponse;
};

export type UndoCheckInResponse = {
  ok: true;
  habit: HabitResponse;
};

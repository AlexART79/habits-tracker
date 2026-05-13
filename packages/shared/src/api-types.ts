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

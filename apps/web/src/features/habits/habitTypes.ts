import type { HabitResponse, HabitStatus } from '@habit-tracker/shared';

export type CompletedTodayFilter = '' | 'true' | 'false';
export type HabitStatusFilter = '' | HabitStatus;

export type HabitFormState =
  | { mode: 'create'; habit?: undefined }
  | { mode: 'edit'; habit: HabitResponse }
  | null;

export type HabitStats = {
  total: number;
  active: number;
  paused: number;
  archived: number;
};

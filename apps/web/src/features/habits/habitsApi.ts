import type {
  Habit,
  HabitWithStats,
  HabitFilters,
  CreateHabitPayload,
  UpdateHabitPayload,
  CheckInsResponse,
} from './types';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options });
  if (!res.ok) {
    let message = 'Request failed';
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = Array.isArray(body.message) ? body.message[0] : body.message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function fetchHabits(filters?: HabitFilters): Promise<HabitWithStats[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.completedToday !== null && filters?.completedToday !== undefined) {
    params.set('completedToday', String(filters.completedToday));
  }
  const qs = params.toString();
  return apiFetch<HabitWithStats[]>(qs ? `/habits?${qs}` : '/habits');
}

export function fetchHabit(id: string): Promise<HabitWithStats> {
  return apiFetch<HabitWithStats>(`/habits/${id}`);
}

export function createHabit(payload: CreateHabitPayload): Promise<Habit> {
  return apiFetch<Habit>('/habits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function updateHabit(id: string, payload: UpdateHabitPayload): Promise<Habit> {
  return apiFetch<Habit>(`/habits/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function deleteHabit(id: string): Promise<void> {
  return apiFetch<void>(`/habits/${id}`, { method: 'DELETE' });
}

export function checkInToday(habitId: string): Promise<void> {
  return apiFetch<void>(`/habits/${habitId}/check-ins/today`, { method: 'POST' });
}

export function undoCheckIn(habitId: string): Promise<void> {
  return apiFetch<void>(`/habits/${habitId}/check-ins/today`, { method: 'DELETE' });
}

export function fetchCheckIns(habitId: string, month: string): Promise<CheckInsResponse> {
  return apiFetch<CheckInsResponse>(`/habits/${habitId}/check-ins?month=${month}`);
}

import type {
  AuthLogoutResponse,
  AuthMeResponse,
  CheckInListResponse,
  CheckInTodayResponse,
  CreateHabitRequest,
  DeleteHabitResponse,
  HabitListResponse,
  ListHabitsRequest,
  HabitResponse,
  HealthResponse,
  UndoCheckInResponse,
  UpdateHabitRequest,
} from '@habit-tracker/shared';

async function readJson<TResponse>(
  response: Response,
  fallbackMessage: string,
): Promise<TResponse> {
  if (!response.ok) {
    throw new Error(fallbackMessage);
  }

  return response.json() as Promise<TResponse>;
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch('/api/health');

  return readJson<HealthResponse>(
    response,
    'Backend health check failed.',
  );
}

export async function getCurrentUser(): Promise<AuthMeResponse> {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
  });

  return readJson<AuthMeResponse>(
    response,
    'Authentication check failed.',
  );
}

export async function logout(): Promise<AuthLogoutResponse> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  return readJson<AuthLogoutResponse>(response, 'Logout failed.');
}

function buildHabitListUrl(filters?: ListHabitsRequest): string {
  const params = new URLSearchParams();
  const search = filters?.search?.trim();

  if (search) {
    params.set('search', search);
  }

  if (filters?.status) {
    params.set('status', filters.status);
  }

  if (filters?.completedToday !== undefined) {
    params.set('completedToday', String(filters.completedToday));
  }

  const queryString = params.toString();

  return queryString ? `/api/habits?${queryString}` : '/api/habits';
}

export async function listHabits(filters?: ListHabitsRequest): Promise<HabitListResponse> {
  const response = await fetch(buildHabitListUrl(filters), {
    credentials: 'include',
  });

  return readJson<HabitListResponse>(response, 'Unable to load habits.');
}

export async function createHabit(
  request: CreateHabitRequest,
): Promise<HabitResponse> {
  const response = await fetch('/api/habits', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  return readJson<HabitResponse>(response, 'Unable to create habit.');
}

export async function updateHabit(
  id: string,
  request: UpdateHabitRequest,
): Promise<HabitResponse> {
  const response = await fetch(`/api/habits/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  return readJson<HabitResponse>(response, 'Unable to update habit.');
}

export async function deleteHabit(id: string): Promise<DeleteHabitResponse> {
  const response = await fetch(`/api/habits/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return readJson<DeleteHabitResponse>(response, 'Unable to delete habit.');
}

export async function checkInToday(id: string): Promise<CheckInTodayResponse> {
  const response = await fetch(`/api/habits/${id}/check-ins/today`, {
    method: 'POST',
    credentials: 'include',
  });

  return readJson<CheckInTodayResponse>(response, 'Unable to check in habit.');
}

export async function undoTodayCheckIn(id: string): Promise<UndoCheckInResponse> {
  const response = await fetch(`/api/habits/${id}/check-ins/today`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return readJson<UndoCheckInResponse>(response, 'Unable to undo check-in.');
}

export async function listCheckIns(
  id: string,
  month: string,
): Promise<CheckInListResponse> {
  const response = await fetch(`/api/habits/${id}/check-ins?month=${month}`, {
    credentials: 'include',
  });

  return readJson<CheckInListResponse>(response, 'Unable to load check-ins.');
}

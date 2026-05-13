import type {
  AuthLogoutResponse,
  AuthMeResponse,
  CreateHabitRequest,
  DeleteHabitResponse,
  HabitListResponse,
  HabitResponse,
  HealthResponse,
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

export async function listHabits(): Promise<HabitListResponse> {
  const response = await fetch('/api/habits', {
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

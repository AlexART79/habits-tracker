import type {
  AuthLogoutResponse,
  AuthMeResponse,
  HealthResponse,
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

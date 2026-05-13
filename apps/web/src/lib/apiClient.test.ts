import type {
  AuthLogoutResponse,
  AuthMeResponse,
  HealthResponse,
} from '@habit-tracker/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCurrentUser, getHealth, logout } from './apiClient';

const mockFetch = vi.fn<typeof fetch>();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});

describe('getHealth', () => {
  it('returns the backend health response when the request succeeds', async () => {
    const healthResponse: HealthResponse = {
      status: 'ok',
      service: 'habit-tracker-api',
      timestamp: '2026-05-12T20:00:00.000Z',
    };

    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(healthResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(getHealth()).resolves.toEqual(healthResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/health');
  });

  it('throws a clear error when the backend health request fails', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 503 }));

    await expect(getHealth()).rejects.toThrow(
      'Backend health check failed.',
    );
  });
});

describe('getCurrentUser', () => {
  it('fetches the current authenticated user with cookies included', async () => {
    const authMeResponse: AuthMeResponse = {
      user: {
        id: 'user-1',
        provider: 'google',
        providerUserId: 'google-user-1',
        email: 'user@example.com',
        displayName: 'Ada Lovelace',
        avatarUrl: 'https://example.com/avatar.png',
      },
    };

    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(authMeResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(getCurrentUser()).resolves.toEqual(authMeResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
      credentials: 'include',
    });
  });
});

describe('logout', () => {
  it('posts to the logout endpoint with cookies included', async () => {
    const logoutResponse: AuthLogoutResponse = { ok: true };

    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(logoutResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(logout()).resolves.toEqual(logoutResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  });
});

import type {
  AuthLogoutResponse,
  AuthMeResponse,
  HabitListResponse,
  HabitResponse,
  HealthResponse,
  CheckInListResponse,
  CheckInTodayResponse,
  UndoCheckInResponse,
} from '@habit-tracker/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createHabit,
  checkInToday,
  deleteHabit,
  getCurrentUser,
  getHealth,
  listCheckIns,
  listHabits,
  logout,
  undoTodayCheckIn,
  updateHabit,
} from './apiClient';

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

describe('habit API', () => {
  const habitResponse: HabitResponse = {
    id: 'habit-1',
    name: 'Read daily',
    description: 'Read for twenty minutes',
    startDate: '2026-05-13',
    status: 'ACTIVE',
    currentStreak: 0,
    bestStreak: 0,
    totalCheckIns: 0,
    completedToday: false,
    createdAt: '2026-05-13T12:00:00.000Z',
    updatedAt: '2026-05-13T12:00:00.000Z',
  };

  it('lists habits with cookies included', async () => {
    const response: HabitListResponse = { habits: [habitResponse] };
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(listHabits()).resolves.toEqual(response);
    expect(mockFetch).toHaveBeenCalledWith('/api/habits', {
      credentials: 'include',
    });
  });

  it('creates a habit with JSON body and cookies included', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(habitResponse), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(
      createHabit({
        name: 'Read daily',
        description: 'Read for twenty minutes',
        startDate: '2026-05-13',
      }),
    ).resolves.toEqual(habitResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/habits', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Read daily',
        description: 'Read for twenty minutes',
        startDate: '2026-05-13',
      }),
    });
  });

  it('updates a habit with JSON body and cookies included', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ ...habitResponse, status: 'PAUSED' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(updateHabit('habit-1', { status: 'PAUSED' })).resolves.toMatchObject({
      status: 'PAUSED',
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/habits/habit-1', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PAUSED' }),
    });
  });

  it('deletes a habit with cookies included', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(deleteHabit('habit-1')).resolves.toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledWith('/api/habits/habit-1', {
      method: 'DELETE',
      credentials: 'include',
    });
  });

  it('surfaces a visible habit API error message', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(listHabits()).rejects.toThrow('Unable to load habits.');
  });

  it('creates a today check-in with cookies included', async () => {
    const response: CheckInTodayResponse = {
      checkIn: {
        id: 'check-in-1',
        habitId: 'habit-1',
        date: '2026-05-14',
        createdAt: '2026-05-14T12:00:00.000Z',
      },
      habit: { ...habitResponse, completedToday: true, currentStreak: 1, bestStreak: 1, totalCheckIns: 1 },
    };
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(checkInToday('habit-1')).resolves.toEqual(response);
    expect(mockFetch).toHaveBeenCalledWith('/api/habits/habit-1/check-ins/today', {
      method: 'POST',
      credentials: 'include',
    });
  });

  it('undoes today check-in with cookies included', async () => {
    const response: UndoCheckInResponse = { ok: true, habit: habitResponse };
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(undoTodayCheckIn('habit-1')).resolves.toEqual(response);
    expect(mockFetch).toHaveBeenCalledWith('/api/habits/habit-1/check-ins/today', {
      method: 'DELETE',
      credentials: 'include',
    });
  });

  it('lists check-ins for a month with cookies included', async () => {
    const response: CheckInListResponse = {
      checkIns: [
        {
          id: 'check-in-1',
          habitId: 'habit-1',
          date: '2026-05-14',
          createdAt: '2026-05-14T12:00:00.000Z',
        },
      ],
    };
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(listCheckIns('habit-1', '2026-05')).resolves.toEqual(response);
    expect(mockFetch).toHaveBeenCalledWith('/api/habits/habit-1/check-ins?month=2026-05', {
      credentials: 'include',
    });
  });
});

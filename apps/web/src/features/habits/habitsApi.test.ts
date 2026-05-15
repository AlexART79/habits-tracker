import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchHabits, createHabit, updateHabit, deleteHabit, ApiError } from './habitsApi';
import type { Habit } from './types';

const MOCK_HABIT: Habit = {
  id: 'h1',
  userId: 'u1',
  name: 'Morning Run',
  description: null,
  startDate: '2026-01-01T00:00:00.000Z',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('fetchHabits', () => {
  it('returns parsed habits', async () => {
    mockFetch(200, [MOCK_HABIT]);
    const habits = await fetchHabits();
    expect(habits).toEqual([MOCK_HABIT]);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith('/habits', expect.objectContaining({ credentials: 'include' }));
  });
});

describe('createHabit', () => {
  it('POSTs payload and returns created habit', async () => {
    mockFetch(201, MOCK_HABIT);
    const habit = await createHabit({ name: 'Morning Run', startDate: '2026-01-01' });
    expect(habit).toEqual(MOCK_HABIT);
    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[1]?.method).toBe('POST');
    expect(JSON.parse(call[1]?.body as string)).toMatchObject({ name: 'Morning Run' });
  });
});

describe('updateHabit', () => {
  it('PATCHes the habit and returns updated habit', async () => {
    const updated = { ...MOCK_HABIT, name: 'Evening Run' };
    mockFetch(200, updated);
    const habit = await updateHabit('h1', { name: 'Evening Run' });
    expect(habit.name).toBe('Evening Run');
    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[1]?.method).toBe('PATCH');
  });
});

describe('deleteHabit', () => {
  it('sends DELETE and returns undefined', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve(null) }),
    );
    const result = await deleteHabit('h1');
    expect(result).toBeUndefined();
    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[1]?.method).toBe('DELETE');
  });
});

describe('error handling', () => {
  it('throws ApiError with status and message on non-ok response', async () => {
    mockFetch(400, { message: 'Name is required' });
    await expect(createHabit({ name: '', startDate: '2026-01-01' })).rejects.toSatisfy(
      (e: unknown) => e instanceof ApiError && e.status === 400 && e.message === 'Name is required',
    );
  });

  it('throws ApiError with status 403 for forbidden responses', async () => {
    mockFetch(403, { message: 'Access denied' });
    await expect(fetchHabits()).rejects.toSatisfy(
      (e: unknown) => e instanceof ApiError && e.status === 403,
    );
  });
});

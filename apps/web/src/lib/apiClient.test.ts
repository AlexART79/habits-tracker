import type { HealthResponse } from '@habit-tracker/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getHealth } from './apiClient';

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

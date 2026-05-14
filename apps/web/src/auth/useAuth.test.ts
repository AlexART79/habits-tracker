import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts in loading state', () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('returns user when GET /auth/me responds 200', async () => {
    const mockUser = { id: 'u1', displayName: 'Alice', email: 'alice@example.com', avatarUrl: null };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    } as Response);

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('sets user to null and no error when GET /auth/me responds 401', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    } as Response);

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets error when fetch rejects (network failure)', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('calls GET /auth/me with credentials: include', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'u2', displayName: 'Bob', email: null, avatarUrl: null }),
    } as Response);

    renderHook(() => useAuth());
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    expect(fetch).toHaveBeenCalledWith('/auth/me', { credentials: 'include' });
  });
});

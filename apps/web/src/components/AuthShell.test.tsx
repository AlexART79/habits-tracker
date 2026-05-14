import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthShell } from './AuthShell';

describe('AuthShell', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a loading indicator while auth state is loading', () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));
    render(<AuthShell><p>Protected content</p></AuthShell>);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('shows the login page when unauthenticated (401)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    } as Response);

    render(<AuthShell><p>Protected content</p></AuthShell>);

    await waitFor(() =>
      expect(screen.getByRole('link', { name: /continue with google/i })).toBeInTheDocument(),
    );
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders children and displayName when authenticated', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'u1', displayName: 'Alice', email: 'alice@example.com', avatarUrl: null }),
    } as Response);

    render(<AuthShell><p>Protected content</p></AuthShell>);

    await waitFor(() => expect(screen.getByText('Protected content')).toBeInTheDocument());
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders a logout button when authenticated', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'u1', displayName: 'Alice', email: null, avatarUrl: null }),
    } as Response);

    render(<AuthShell><p>content</p></AuthShell>);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument(),
    );
  });

  it('calls POST /auth/logout and shows login page when logout is clicked', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'u1', displayName: 'Alice', email: null, avatarUrl: null }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Logged out' }),
      } as Response);

    render(<AuthShell><p>content</p></AuthShell>);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole('button', { name: /log out/i }));

    expect(fetch).toHaveBeenCalledWith('/auth/logout', { method: 'POST', credentials: 'include' });

    await waitFor(() =>
      expect(screen.getByRole('link', { name: /continue with google/i })).toBeInTheDocument(),
    );
  });
});

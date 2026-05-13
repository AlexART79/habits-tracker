import type { AuthLogoutResponse, AuthMeResponse } from '@habit-tracker/shared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';

const { mockGetCurrentUser, mockLogout } = vi.hoisted(() => ({
  mockGetCurrentUser: vi.fn<() => Promise<AuthMeResponse>>(),
  mockLogout: vi.fn<() => Promise<AuthLogoutResponse>>(),
}));

vi.mock('../../lib/apiClient', () => ({
  getCurrentUser: mockGetCurrentUser,
  logout: mockLogout,
}));

function AuthProbe() {
  const { errorMessage, logout, status, user } = useAuth();

  return (
    <div>
      <p role="status">{status}</p>
      {user ? <p>{user.displayName}</p> : null}
      {errorMessage ? <p role="alert">{errorMessage}</p> : null}
      <button type="button" onClick={() => void logout()}>
        Sign out
      </button>
    </div>
  );
}

describe('AuthProvider', () => {
  it('bootstraps the current user and exposes authenticated state', async () => {
    mockGetCurrentUser.mockResolvedValue({
      user: {
        id: 'user-1',
        provider: 'github',
        providerUserId: 'github-user-1',
        email: null,
        displayName: 'Grace Hopper',
        avatarUrl: null,
      },
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('loading');
    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('authenticated');
  });

  it('treats bootstrap failure as unauthenticated without surfacing an error', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(await screen.findByRole('status')).toHaveTextContent(
      'unauthenticated',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('logs out through the API client and clears the authenticated user', async () => {
    const user = userEvent.setup();

    mockGetCurrentUser.mockResolvedValue({
      user: {
        id: 'user-1',
        provider: 'google',
        providerUserId: 'google-user-1',
        email: 'user@example.com',
        displayName: 'Ada Lovelace',
        avatarUrl: null,
      },
    });
    mockLogout.mockResolvedValue({ ok: true });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(mockLogout).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toHaveTextContent('unauthenticated');
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
  });
});

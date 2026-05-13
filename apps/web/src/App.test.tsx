import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';

const mockFetch = vi.fn<typeof fetch>();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});

describe('App', () => {
  it('shows sign-in status while auth state is loading', () => {
    mockFetch.mockReturnValue(new Promise(() => undefined));

    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Checking sign-in status...',
    );
  });

  it('renders Google and GitHub login buttons when unauthenticated', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 401 }));

    render(<App />);

    expect(
      await screen.findByRole('link', { name: 'Continue with Google' }),
    ).toHaveAttribute('href', '/api/auth/google');
    expect(
      screen.getByRole('link', { name: 'Continue with GitHub' }),
    ).toHaveAttribute('href', '/api/auth/github');
  });

  it('renders authenticated shell with the user display name', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          user: {
            id: 'user-1',
            provider: 'test',
            providerUserId: 'test-user-1',
            email: null,
            displayName: 'Ada Lovelace',
            avatarUrl: null,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    render(<App />);

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Log out' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Search habits')).toBeDisabled();
  });

  it('logs out and returns to the login screen', async () => {
    mockFetch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            user: {
              id: 'user-1',
              provider: 'test',
              providerUserId: 'test-user-1',
              email: null,
              displayName: 'Ada Lovelace',
              avatarUrl: null,
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Log out' }));

    expect(mockFetch).toHaveBeenLastCalledWith('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    expect(
      await screen.findByRole('link', { name: 'Continue with Google' }),
    ).toBeInTheDocument();
  });
});

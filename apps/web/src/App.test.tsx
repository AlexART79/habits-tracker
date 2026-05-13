import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';

const mockFetch = vi.fn<typeof fetch>();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
  localStorage.clear();
  document.documentElement.className = '';
  document.documentElement.removeAttribute('data-theme');
});

describe('App', () => {
  const authResponse = {
    user: {
      id: 'user-1',
      provider: 'test',
      providerUserId: 'test-user-1',
      email: null,
      displayName: 'Ada Lovelace',
      avatarUrl: null,
    },
  };

  const activeHabit = {
    id: 'habit-1',
    name: 'Read daily',
    description: 'Read for twenty minutes',
    startDate: '2026-05-13',
    status: 'ACTIVE',
    createdAt: '2026-05-13T12:00:00.000Z',
    updatedAt: '2026-05-13T12:00:00.000Z',
  };

  function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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
    mockFetch
      .mockResolvedValueOnce(jsonResponse(authResponse))
      .mockResolvedValueOnce(jsonResponse({ habits: [] }));

    render(<App />);

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    const logoutButton = screen.getByRole('button', { name: 'Log out' });
    const themeToggle = screen.getByRole('button', {
      name: 'Switch to light theme',
    });
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).not.toHaveTextContent('Log out');
    expect(themeToggle).toBeInTheDocument();
    expect(themeToggle).not.toHaveTextContent('Light');
    expect(await screen.findByText('No habits yet.')).toBeInTheDocument();
  });

  it('renders the authenticated header as a distinct sticky top bar', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(authResponse))
      .mockResolvedValueOnce(jsonResponse({ habits: [] }));

    render(<App />);

    const header = (await screen.findByText('Habit Tracker with Streaks')).closest('header');

    expect(header).toHaveClass('sticky', 'top-0', 'z-30', 'shadow-md');
    expect(header).not.toHaveClass('rounded-lg', 'border');
  });

  it('defaults to dark theme and persists manual theme selections', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(authResponse))
      .mockResolvedValueOnce(jsonResponse({ habits: [] }));

    const user = userEvent.setup();
    render(<App />);

    const themeToggle = await screen.findByRole('button', {
      name: 'Switch to light theme',
    });

    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    await user.click(themeToggle);

    expect(document.documentElement).not.toHaveClass('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem('habit-tracker-theme')).toBe('light');
    const darkThemeToggle = screen.getByRole('button', {
      name: 'Switch to dark theme',
    });
    expect(darkThemeToggle).not.toHaveTextContent('Dark');

    await user.click(darkThemeToggle);

    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('habit-tracker-theme')).toBe('dark');
    expect(
      screen.getByRole('button', { name: 'Switch to light theme' }),
    ).toBeInTheDocument();
  });

  it('logs out and returns to the login screen', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(authResponse))
      .mockResolvedValueOnce(jsonResponse({ habits: [] }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

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

  it('shows habit list loading, empty, and error states', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(authResponse))
      .mockReturnValueOnce(new Promise(() => undefined));

    render(<App />);

    expect(await screen.findByText('Loading habits...')).toBeInTheDocument();

    mockFetch.mockReset();
    mockFetch
      .mockResolvedValueOnce(jsonResponse(authResponse))
      .mockResolvedValueOnce(jsonResponse({ habits: [] }));
    render(<App />);

    expect(await screen.findByText('No habits yet.')).toBeInTheDocument();

    mockFetch.mockReset();
    mockFetch
      .mockResolvedValueOnce(jsonResponse(authResponse))
      .mockResolvedValueOnce(new Response(null, { status: 500 }));
    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load habits.',
    );
  });

  it('renders habit cards with status and details', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(authResponse))
      .mockResolvedValueOnce(jsonResponse({ habits: [activeHabit] }));

    render(<App />);

    expect(await screen.findByText('Read daily')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('Read for twenty minutes')).toBeInTheDocument();
    expect(screen.getByText('Starts 2026-05-13')).toBeInTheDocument();
  });

  it('validates and creates a habit from the form', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(authResponse))
      .mockResolvedValueOnce(jsonResponse({ habits: [] }))
      .mockResolvedValueOnce(jsonResponse(activeHabit, 201))
      .mockResolvedValueOnce(jsonResponse({ habits: [activeHabit] }));

    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Create habit' }));
    await user.click(screen.getByRole('button', { name: 'Save habit' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Name is required.');

    await user.type(screen.getByLabelText('Habit name'), 'Read daily');
    await user.type(
      screen.getByLabelText('Description'),
      'Read for twenty minutes',
    );
    await user.clear(screen.getByLabelText('Start date'));
    await user.type(screen.getByLabelText('Start date'), '2026-05-13');
    await user.click(screen.getByRole('button', { name: 'Save habit' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/habits', expect.objectContaining({
        method: 'POST',
      }));
    });
    expect(await screen.findByText('Read daily')).toBeInTheDocument();
  });

  it('edits a habit inline and refreshes the list', async () => {
    const secondHabit = {
      ...activeHabit,
      id: 'habit-2',
      name: 'Walk outside',
      description: 'Ten minute walk',
    };
    const updatedHabit = { ...activeHabit, name: 'Read deeply' };
    mockFetch
      .mockResolvedValueOnce(jsonResponse(authResponse))
      .mockResolvedValueOnce(jsonResponse({ habits: [activeHabit, secondHabit] }))
      .mockResolvedValueOnce(jsonResponse(updatedHabit))
      .mockResolvedValueOnce(jsonResponse({ habits: [updatedHabit, secondHabit] }));

    const user = userEvent.setup();
    render(<App />);

    const editButton = await screen.findByRole('button', { name: 'Edit Read daily' });
    expect(editButton).not.toHaveTextContent('Edit');

    await user.click(editButton);
    const habitList = screen.getByRole('list', { name: 'Habit list' });
    const editForm = screen.getByRole('form', { name: 'Edit habit form' });
    const secondHabitHeading = screen.getByRole('heading', { name: 'Walk outside' });

    expect(habitList).toContainElement(editForm);
    expect(screen.queryByRole('heading', { name: 'Read daily' })).not.toBeInTheDocument();
    expect(
      editForm.compareDocumentPosition(secondHabitHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await user.clear(screen.getByLabelText('Habit name'));
    await user.type(screen.getByLabelText('Habit name'), 'Read deeply');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Read deeply')).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledWith('/api/habits/habit-1', expect.objectContaining({
      method: 'PATCH',
    }));
  });

  it('changes habit status and shows archived habits as read-only', async () => {
    const pausedHabit = { ...activeHabit, status: 'PAUSED' };
    const archivedHabit = { ...activeHabit, status: 'ARCHIVED' };
    mockFetch
      .mockResolvedValueOnce(jsonResponse(authResponse))
      .mockResolvedValueOnce(jsonResponse({ habits: [activeHabit] }))
      .mockResolvedValueOnce(jsonResponse(pausedHabit))
      .mockResolvedValueOnce(jsonResponse({ habits: [pausedHabit] }))
      .mockResolvedValueOnce(jsonResponse(archivedHabit))
      .mockResolvedValueOnce(jsonResponse({ habits: [archivedHabit] }));

    const user = userEvent.setup();
    render(<App />);

    const pauseButton = await screen.findByRole('button', { name: 'Pause Read daily' });
    expect(pauseButton).not.toHaveTextContent('Pause');

    await user.click(pauseButton);
    expect(await screen.findByText('PAUSED')).toBeInTheDocument();

    const archiveButton = screen.getByRole('button', { name: 'Archive Read daily' });
    expect(archiveButton).not.toHaveTextContent('Archive');

    await user.click(archiveButton);
    expect(await screen.findByText('ARCHIVED')).toBeInTheDocument();
    expect(screen.getByText('Archived habits are read-only.')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit Read daily' }),
    ).not.toBeInTheDocument();
  });

  it('requires confirmation before deleting a habit', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(authResponse))
      .mockResolvedValueOnce(jsonResponse({ habits: [activeHabit] }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
      .mockResolvedValueOnce(jsonResponse({ habits: [] }));

    const user = userEvent.setup();
    render(<App />);

    const deleteButton = await screen.findByRole('button', { name: 'Delete Read daily' });
    expect(deleteButton).not.toHaveTextContent('Delete');

    await user.click(deleteButton);
    expect(
      screen.getByText('Are you sure you want to delete Read daily?'),
    ).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalledWith('/api/habits/habit-1', {
      method: 'DELETE',
      credentials: 'include',
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(
      screen.queryByText('Are you sure you want to delete Read daily?'),
    ).not.toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalledWith('/api/habits/habit-1', {
      method: 'DELETE',
      credentials: 'include',
    });

    await user.click(screen.getByRole('button', { name: 'Delete Read daily' }));
    await user.click(screen.getByRole('button', { name: 'Confirm delete Read daily' }));

    expect(await screen.findByText('No habits yet.')).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledWith('/api/habits/habit-1', {
      method: 'DELETE',
      credentials: 'include',
    });
  });
});

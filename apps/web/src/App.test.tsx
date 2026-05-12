import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';

const mockFetch = vi.fn<typeof fetch>();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});

describe('App', () => {
  it('renders the habit tracker shell while backend health is loading', () => {
    mockFetch.mockReturnValue(new Promise(() => undefined));

    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Habit Tracker' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Checking backend connection...'),
    ).toBeInTheDocument();
  });

  it('shows the connected state after the health check succeeds', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 'ok',
          service: 'habit-tracker-api',
          timestamp: '2026-05-12T20:00:00.000Z',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    render(<App />);

    expect(await screen.findByText('API connected')).toBeInTheDocument();
  });

  it('renders disabled first habit and search controls accessibly', () => {
    mockFetch.mockReturnValue(new Promise(() => undefined));

    render(<App />);

    expect(
      screen.getByRole('button', { name: 'Create first habit' }),
    ).toBeDisabled();
    expect(screen.getByLabelText('Search habits')).toBeDisabled();
  });

  it('shows an alert when the backend health check fails', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 503 }));

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Backend health check failed.',
    );
  });
});

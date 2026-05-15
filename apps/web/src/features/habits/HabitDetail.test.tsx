import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitDetail } from './HabitDetail';
import type { HabitWithStats } from './types';

const mockFetchCheckIns = vi.fn();

vi.mock('./habitsApi', () => ({
  fetchCheckIns: (...args: unknown[]) => mockFetchCheckIns(...args),
}));

const HABIT: HabitWithStats = {
  id: 'h1',
  userId: 'u1',
  name: 'Morning Run',
  description: 'Run every day',
  startDate: '2026-01-01T00:00:00.000Z',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  currentStreak: 5,
  bestStreak: 10,
  totalCheckIns: 20,
  completedToday: true,
};

beforeEach(() => {
  mockFetchCheckIns.mockResolvedValue({ dates: [] });
});

describe('HabitDetail', () => {
  it('renders the habit name', async () => {
    render(<HabitDetail habit={HABIT} onClose={vi.fn()} />);
    expect(screen.getByText('Morning Run')).toBeInTheDocument();
  });

  it('renders streak values', async () => {
    render(<HabitDetail habit={HABIT} onClose={vi.fn()} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('shows empty state when no check-ins for the month', async () => {
    mockFetchCheckIns.mockResolvedValue({ dates: [] });
    render(<HabitDetail habit={HABIT} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/no check-ins this month/i)).toBeInTheDocument();
    });
  });

  it('marks checked-in dates on the calendar', async () => {
    const today = new Date().toISOString().split('T')[0];
    mockFetchCheckIns.mockResolvedValue({ dates: [today] });
    render(<HabitDetail habit={HABIT} onClose={vi.fn()} />);
    await waitFor(() => {
      const day = screen.getByTitle(today);
      expect(day.className).toContain('bg-blue-500');
    });
  });

  it('calls onClose when Close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<HabitDetail habit={HABIT} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<HabitDetail habit={HABIT} onClose={onClose} />);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitList } from './HabitList';
import type { HabitWithStats } from './types';

vi.mock('./habitsApi', () => ({
  updateHabit: vi.fn().mockResolvedValue({}),
  deleteHabit: vi.fn().mockResolvedValue(undefined),
  checkInToday: vi.fn().mockResolvedValue(undefined),
  undoCheckIn: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./HabitDetail', () => ({
  HabitDetail: () => <div data-testid="habit-detail-mock" />,
}));

const HABIT: HabitWithStats = {
  id: 'h1',
  userId: 'u1',
  name: 'Morning Run',
  description: null,
  startDate: '2026-01-01T00:00:00.000Z',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  currentStreak: 2,
  bestStreak: 5,
  totalCheckIns: 8,
  completedToday: false,
};

describe('HabitList', () => {
  it('shows loading skeleton while loading', () => {
    const { container } = render(
      <HabitList habits={[]} loading={true} error={null} onReload={vi.fn()} />,
    );
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows an error message with a Retry button on error', () => {
    const onReload = vi.fn();
    render(
      <HabitList habits={[]} loading={false} error="Failed to load" onReload={onReload} />,
    );
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('calls onReload when Retry is clicked', async () => {
    const user = userEvent.setup();
    const onReload = vi.fn();
    render(
      <HabitList habits={[]} loading={false} error="Oops" onReload={onReload} />,
    );
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(onReload).toHaveBeenCalledOnce();
  });

  it('shows empty state message when there are no habits', () => {
    render(
      <HabitList habits={[]} loading={false} error={null} onReload={vi.fn()} />,
    );
    expect(screen.getByText(/no habits yet/i)).toBeInTheDocument();
  });

  it('shows "no results" message when habits are empty and filters are active', () => {
    render(
      <HabitList habits={[]} loading={false} error={null} onReload={vi.fn()} hasFilters={true} />,
    );
    expect(screen.getByText(/no habits match your filters/i)).toBeInTheDocument();
  });

  it('renders habit cards when habits are present', () => {
    render(
      <HabitList habits={[HABIT]} loading={false} error={null} onReload={vi.fn()} />,
    );
    expect(screen.getByText('Morning Run')).toBeInTheDocument();
  });

  it('calls onReload after check-in', async () => {
    const { checkInToday } = await import('./habitsApi');
    const user = userEvent.setup();
    const onReload = vi.fn();
    render(
      <HabitList habits={[HABIT]} loading={false} error={null} onReload={onReload} />,
    );
    await user.click(screen.getByRole('button', { name: 'Check in' }));
    expect(checkInToday).toHaveBeenCalledWith('h1');
    expect(onReload).toHaveBeenCalled();
  });

  it('calls onReload after undo check-in', async () => {
    const { undoCheckIn } = await import('./habitsApi');
    const user = userEvent.setup();
    const onReload = vi.fn();
    render(
      <HabitList
        habits={[{ ...HABIT, completedToday: true }]}
        loading={false}
        error={null}
        onReload={onReload}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Undo check-in' }));
    expect(undoCheckIn).toHaveBeenCalledWith('h1');
    expect(onReload).toHaveBeenCalled();
  });
});

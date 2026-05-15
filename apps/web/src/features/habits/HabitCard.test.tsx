import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitCard } from './HabitCard';
import type { HabitWithStats } from './types';

const BASE_HABIT: HabitWithStats = {
  id: 'h1',
  userId: 'u1',
  name: 'Morning Run',
  description: 'Run 5km every morning',
  startDate: '2026-01-01T00:00:00.000Z',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  currentStreak: 3,
  bestStreak: 7,
  totalCheckIns: 10,
  completedToday: false,
};

function renderCard(habit: HabitWithStats = BASE_HABIT) {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const onArchive = vi.fn();
  const onStatusChange = vi.fn();
  const onCheckIn = vi.fn().mockResolvedValue(undefined);
  const onUndoCheckIn = vi.fn().mockResolvedValue(undefined);
  const onViewDetail = vi.fn();
  render(
    <HabitCard
      habit={habit}
      onEdit={onEdit}
      onDelete={onDelete}
      onArchive={onArchive}
      onStatusChange={onStatusChange}
      onCheckIn={onCheckIn}
      onUndoCheckIn={onUndoCheckIn}
      onViewDetail={onViewDetail}
    />,
  );
  return { onEdit, onDelete, onArchive, onStatusChange, onCheckIn, onUndoCheckIn, onViewDetail };
}

describe('HabitCard', () => {
  it('renders the habit name and description', () => {
    renderCard();
    expect(screen.getByText('Morning Run')).toBeInTheDocument();
    expect(screen.getByText('Run 5km every morning')).toBeInTheDocument();
  });

  it('renders the ACTIVE status badge', () => {
    renderCard();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('renders streak values', () => {
    renderCard();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('shows Check In button for active habit not completed today', () => {
    renderCard({ ...BASE_HABIT, completedToday: false });
    expect(screen.getByRole('button', { name: 'Check in' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Undo check-in' })).not.toBeInTheDocument();
  });

  it('shows Undo button for active habit completed today', () => {
    renderCard({ ...BASE_HABIT, completedToday: true });
    expect(screen.getByRole('button', { name: 'Undo check-in' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Check in' })).not.toBeInTheDocument();
  });

  it('shows a disabled Check In button for PAUSED habit', () => {
    renderCard({ ...BASE_HABIT, status: 'PAUSED' });
    const btn = screen.getByRole('button', { name: 'Check in' });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Undo check-in' })).not.toBeInTheDocument();
  });

  it('has no check-in or undo button for ARCHIVED habit', () => {
    renderCard({ ...BASE_HABIT, status: 'ARCHIVED' });
    expect(screen.queryByRole('button', { name: 'Check in' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Undo check-in' })).not.toBeInTheDocument();
  });

  it('shows Edit, Pause, and Archive buttons for ACTIVE habit', () => {
    renderCard();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Archive' })).toBeInTheDocument();
  });

  it('shows Edit, Resume, and Archive buttons for PAUSED habit', () => {
    renderCard({ ...BASE_HABIT, status: 'PAUSED' });
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Archive' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument();
  });

  it('shows only Delete and View details buttons for ARCHIVED habit', () => {
    renderCard({ ...BASE_HABIT, status: 'ARCHIVED' });
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View details' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument();
  });

  it('calls onEdit when Edit is clicked', async () => {
    const user = userEvent.setup();
    const { onEdit } = renderCard();
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(BASE_HABIT);
  });

  it('calls onStatusChange with PAUSED when Pause is clicked', async () => {
    const user = userEvent.setup();
    const { onStatusChange } = renderCard();
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    expect(onStatusChange).toHaveBeenCalledWith(BASE_HABIT, 'PAUSED');
  });

  it('calls onDelete when Delete is clicked', async () => {
    const user = userEvent.setup();
    const { onDelete } = renderCard();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(BASE_HABIT);
  });

  it('calls onCheckIn when Check In is clicked', async () => {
    const user = userEvent.setup();
    const { onCheckIn } = renderCard({ ...BASE_HABIT, completedToday: false });
    await user.click(screen.getByRole('button', { name: 'Check in' }));
    expect(onCheckIn).toHaveBeenCalledWith(BASE_HABIT);
  });

  it('calls onUndoCheckIn when Undo is clicked', async () => {
    const user = userEvent.setup();
    const doneHabit = { ...BASE_HABIT, completedToday: true };
    const { onUndoCheckIn } = renderCard(doneHabit);
    await user.click(screen.getByRole('button', { name: 'Undo check-in' }));
    expect(onUndoCheckIn).toHaveBeenCalledWith(doneHabit);
  });

  it('calls onViewDetail when View details is clicked', async () => {
    const user = userEvent.setup();
    const { onViewDetail } = renderCard();
    await user.click(screen.getByRole('button', { name: 'View details' }));
    expect(onViewDetail).toHaveBeenCalledWith(BASE_HABIT);
  });
});

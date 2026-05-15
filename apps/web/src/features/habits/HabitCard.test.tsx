import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitCard } from './HabitCard';
import type { Habit } from './types';

const BASE_HABIT: Habit = {
  id: 'h1',
  userId: 'u1',
  name: 'Morning Run',
  description: 'Run 5km every morning',
  startDate: '2026-01-01T00:00:00.000Z',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderCard(habit: Habit = BASE_HABIT) {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const onStatusChange = vi.fn();
  render(<HabitCard habit={habit} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />);
  return { onEdit, onDelete, onStatusChange };
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

  it('shows only Delete button for ARCHIVED habit', () => {
    renderCard({ ...BASE_HABIT, status: 'ARCHIVED' });
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
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
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationToast } from './NotificationToast';
import type { MilestoneReachedPayload } from './types';

const NOTIFICATION: MilestoneReachedPayload = {
  notificationId: 'notif-1',
  habitId: 'habit-1',
  habitName: 'Morning Run',
  milestone: 7,
  currentStreak: 7,
};

describe('NotificationToast', () => {
  it('renders nothing when notifications list is empty', () => {
    const { container } = render(<NotificationToast notifications={[]} onAck={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders milestone message for a notification', () => {
    render(<NotificationToast notifications={[NOTIFICATION]} onAck={vi.fn()} />);
    expect(screen.getByText('Morning Run')).toBeInTheDocument();
    expect(screen.getByText('7-day streak! Keep it up.')).toBeInTheDocument();
  });

  it('calls onAck with notificationId when dismiss button clicked', () => {
    const onAck = vi.fn();
    render(<NotificationToast notifications={[NOTIFICATION]} onAck={onAck} />);

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onAck).toHaveBeenCalledWith('notif-1');
  });

  it('does not auto-dismiss without user interaction', () => {
    const onAck = vi.fn();
    render(<NotificationToast notifications={[NOTIFICATION]} onAck={onAck} />);
    expect(onAck).not.toHaveBeenCalled();
  });

  it('renders multiple notifications', () => {
    const second: MilestoneReachedPayload = { ...NOTIFICATION, notificationId: 'notif-2', habitName: 'Read', milestone: 3 };
    render(<NotificationToast notifications={[NOTIFICATION, second]} onAck={vi.fn()} />);
    expect(screen.getByText('Morning Run')).toBeInTheDocument();
    expect(screen.getByText('Read')).toBeInTheDocument();
    expect(screen.getByText('3-day streak! Keep it up.')).toBeInTheDocument();
  });
});

import { IconClose } from '../../components/icons';
import type { MilestoneReachedPayload } from './types';

interface ToastCardProps {
  notification: MilestoneReachedPayload;
  onAck: (id: string) => void;
}

export function ToastCard({ notification, onAck }: ToastCardProps) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 w-80"
    >
      <span className="text-2xl leading-none mt-0.5">🏆</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{notification.habitName}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {notification.milestone}-day streak! Keep it up.
        </p>
      </div>
      <button
        onClick={() => onAck(notification.notificationId)}
        aria-label="Dismiss notification"
        className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5"
      >
        <IconClose />
      </button>
    </div>
  );
}

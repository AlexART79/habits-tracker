import type { MilestoneReachedPayload } from './types';

interface Props {
  notifications: MilestoneReachedPayload[];
  onAck: (notificationId: string) => void;
}

function ToastCard({ notification, onAck }: { notification: MilestoneReachedPayload; onAck: (id: string) => void }) {
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
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function NotificationToast({ notifications, onAck }: Props) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
      {notifications.map((n) => (
        <ToastCard key={n.notificationId} notification={n} onAck={onAck} />
      ))}
    </div>
  );
}

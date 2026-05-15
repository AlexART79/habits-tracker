import { ToastCard } from './ToastCard';
import type { MilestoneReachedPayload } from './types';

interface Props {
  notifications: MilestoneReachedPayload[];
  onAck: (notificationId: string) => void;
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

import { X } from 'lucide-react';
import { IconButton } from '../../components/IconButton';
import { NOTIFICATION_COPY } from './notificationConstants';
import { useMilestoneNotifications } from './useMilestoneNotifications';

export function MilestoneNotifications(): JSX.Element | null {
  const { dismissNotification, notifications } = useMilestoneNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={NOTIFICATION_COPY.regionLabel}
      className="grid gap-3 pb-5"
    >
      {notifications.map((notification) => (
        <div
          role="status"
          key={notification.notificationId}
          className="flex items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-950 shadow-sm dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-50"
        >
          <p className="text-sm font-semibold">
            {NOTIFICATION_COPY.milestoneMessage(
              notification.habitName,
              notification.milestone,
            )}
          </p>
          <IconButton
            aria-label={NOTIFICATION_COPY.dismissLabel(notification.habitName)}
            className="h-9 w-9"
            onClick={() => dismissNotification(notification.notificationId)}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </IconButton>
        </div>
      ))}
    </section>
  );
}

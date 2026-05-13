import type { HabitResponse, HabitStatus } from '@habit-tracker/shared';
import { Card } from '../../components/Card';
import { CheckInHistory } from './CheckInHistory';
import { HabitArchiveConfirmation } from './HabitArchiveConfirmation';
import { HabitArchivedNotice } from './HabitArchivedNotice';
import { HabitCardHeader } from './HabitCardHeader';
import { HabitCheckInActions } from './HabitCheckInActions';
import { HabitDeleteConfirmation } from './HabitDeleteConfirmation';
import { HabitStatusActions } from './HabitStatusActions';
import { HabitStreakStats } from './HabitStreakStats';

type HabitCardProps = {
  habit: HabitResponse;
  isArchiving: boolean;
  isDeleting: boolean;
  isMutating: boolean;
  onCancelArchive: () => void;
  onCancelDelete: () => void;
  onCheckIn: (habit: HabitResponse) => Promise<void>;
  onDelete: (habit: HabitResponse) => Promise<void>;
  onEdit: (habit: HabitResponse) => void;
  onRequestArchive: (habit: HabitResponse) => void;
  onRequestDelete: (habit: HabitResponse) => void;
  onStatusChange: (habit: HabitResponse, status: HabitStatus) => Promise<void>;
  onUndoCheckIn: (habit: HabitResponse) => Promise<void>;
};

export function HabitCard({
  habit,
  isArchiving,
  isDeleting,
  isMutating,
  onCancelArchive,
  onCancelDelete,
  onCheckIn,
  onDelete,
  onEdit,
  onRequestArchive,
  onRequestDelete,
  onStatusChange,
  onUndoCheckIn,
}: HabitCardProps): JSX.Element {
  const isArchived = habit.status === 'ARCHIVED';

  return (
    <Card className="grid gap-4 p-4">
      <HabitCardHeader habit={habit} />
      {isArchived ? <HabitArchivedNotice /> : null}
      <HabitStreakStats habit={habit} />
      <HabitCheckInActions
        habit={habit}
        isMutating={isMutating}
        onCheckIn={onCheckIn}
        onUndoCheckIn={onUndoCheckIn}
      />

      {isArchiving ? (
        <HabitArchiveConfirmation
          habit={habit}
          isMutating={isMutating}
          onCancel={onCancelArchive}
          onStatusChange={onStatusChange}
        />
      ) : null}

      {isDeleting ? (
        <HabitDeleteConfirmation
          habit={habit}
          isMutating={isMutating}
          onCancel={onCancelDelete}
          onDelete={onDelete}
        />
      ) : null}

      <HabitStatusActions
        habit={habit}
        isMutating={isMutating}
        onEdit={onEdit}
        onRequestArchive={onRequestArchive}
        onRequestDelete={onRequestDelete}
        onStatusChange={onStatusChange}
      />
      <CheckInHistory habitId={habit.id} habitName={habit.name} />
    </Card>
  );
}

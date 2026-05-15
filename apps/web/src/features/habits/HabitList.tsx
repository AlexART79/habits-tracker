import { Button } from '../../components/Button';
import { HabitCard } from './HabitCard';
import { HabitModal } from './HabitModal';
import { HabitDetail } from './HabitDetail';
import { HabitSkeletonList } from './HabitSkeletonList';
import { updateHabit, deleteHabit, checkInToday, undoCheckIn } from './habitsApi';
import { useHabitListModals } from './useHabitListModals';
import { CONFIRM_ARCHIVE, CONFIRM_DELETE } from './constants';
import type { HabitWithStats, HabitStatus } from './types';

interface HabitListProps {
  habits: HabitWithStats[];
  loading: boolean;
  error: string | null;
  onReload: () => void;
  onCreateClick?: () => void;
  hasFilters?: boolean;
}

export function HabitList({ habits, loading, error, onReload, hasFilters }: HabitListProps) {
  const { editingHabit, detailHabit, openEdit, closeEdit, openDetail, closeDetail } =
    useHabitListModals();

  async function handleStatusChange(habit: HabitWithStats, status: HabitStatus) {
    await updateHabit(habit.id, { status });
    onReload();
  }

  async function handleArchive(habit: HabitWithStats) {
    if (!window.confirm(CONFIRM_ARCHIVE(habit.name))) return;
    await updateHabit(habit.id, { status: 'ARCHIVED' });
    onReload();
  }

  async function handleDelete(habit: HabitWithStats) {
    if (!window.confirm(CONFIRM_DELETE(habit.name))) return;
    await deleteHabit(habit.id);
    onReload();
  }

  async function handleCheckIn(habit: HabitWithStats) {
    await checkInToday(habit.id);
    onReload();
  }

  async function handleUndoCheckIn(habit: HabitWithStats) {
    await undoCheckIn(habit.id);
    onReload();
  }

  if (loading) return <HabitSkeletonList />;

  if (error) {
    return (
      <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 flex items-center justify-between gap-4">
        <span>{error}</span>
        <Button variant="secondary" onClick={onReload}>
          Retry
        </Button>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {hasFilters
            ? 'No habits match your filters.'
            : 'No habits yet. Create your first habit!'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onEdit={openEdit}
            onDelete={handleDelete}
            onArchive={handleArchive}
            onStatusChange={handleStatusChange}
            onCheckIn={handleCheckIn}
            onUndoCheckIn={handleUndoCheckIn}
            onViewDetail={openDetail}
          />
        ))}
      </div>
      {editingHabit && (
        <HabitModal
          mode="edit"
          habit={editingHabit}
          onClose={closeEdit}
          onSaved={() => {
            closeEdit();
            onReload();
          }}
        />
      )}
      {detailHabit && (
        <HabitDetail habit={detailHabit} onClose={closeDetail} />
      )}
    </>
  );
}

import { useState } from 'react';
import { AuthShell } from './components/AuthShell';
import { Button } from './components/Button';
import { HabitList } from './features/habits/HabitList';
import { HabitFilters } from './features/habits/HabitFilters';
import { HabitModal } from './features/habits/HabitModal';
import { useHabits } from './features/habits/useHabits';
import { useNotifications } from './features/notifications/useNotifications';
import { NotificationToast } from './features/notifications/NotificationToast';
import type { HabitFilters as HabitFiltersType } from './features/habits/types';

function App() {
  const [filters, setFilters] = useState<HabitFiltersType>({});
  const { habits, loading, error, reload } = useHabits(filters);
  const [createOpen, setCreateOpen] = useState(false);
  const hasFilters = Boolean(filters.search || filters.status || filters.completedToday != null);
  const { notifications, acknowledge } = useNotifications();

  return (
    <AuthShell>
      <div className="flex flex-wrap items-center justify-between gap-y-2 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-300">My Habits</h2>
        <Button onClick={() => setCreateOpen(true)}>New Habit</Button>
      </div>
      <HabitFilters filters={filters} onChange={setFilters} />
      <HabitList
        habits={habits}
        loading={loading}
        error={error}
        onReload={reload}
        onCreateClick={() => setCreateOpen(true)}
        hasFilters={hasFilters}
      />
      {createOpen && (
        <HabitModal
          mode="create"
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            reload();
          }}
        />
      )}
      <NotificationToast notifications={notifications} onAck={acknowledge} />
    </AuthShell>
  );
}

export default App;

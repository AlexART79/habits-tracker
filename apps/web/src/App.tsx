import { useState } from 'react';
import { AuthShell } from './components/AuthShell';
import { Button } from './components/Button';
import { HabitList } from './features/habits/HabitList';
import { HabitModal } from './features/habits/HabitModal';
import { useHabits } from './features/habits/useHabits';

function App() {
  const { habits, loading, error, reload } = useHabits();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <AuthShell>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Habits</h2>
        <Button onClick={() => setCreateOpen(true)}>New Habit</Button>
      </div>
      <HabitList
        habits={habits}
        loading={loading}
        error={error}
        onReload={reload}
        onCreateClick={() => setCreateOpen(true)}
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
    </AuthShell>
  );
}

export default App;

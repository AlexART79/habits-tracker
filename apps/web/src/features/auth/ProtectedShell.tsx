import { Button } from '../../components/Button';
import { HabitDashboard } from '../habits/HabitDashboard';
import { useAuth } from './AuthProvider';

export function ProtectedShell(): JSX.Element {
  const { errorMessage, logout, user } = useAuth();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-emerald-800">
            Habit Tracker with Streaks
          </p>
          <h1 className="text-3xl font-bold text-slate-950">Habit Tracker</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-medium text-slate-700">
            {user?.displayName}
          </span>
          <Button type="button" onClick={() => void logout()}>
            Log out
          </Button>
        </div>
      </header>

      {errorMessage ? (
        <p role="alert" className="mb-4 font-medium text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <HabitDashboard />
    </main>
  );
}

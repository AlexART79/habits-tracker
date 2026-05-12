import { useEffect, useState } from 'react';

import { Button } from './components/Button';
import { Card } from './components/Card';
import { Input } from './components/Input';
import { getHealth } from './lib/apiClient';

type HealthStatus = 'loading' | 'connected' | 'error';

export function App(): JSX.Element {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getHealth()
      .then(() => {
        if (isMounted) {
          setHealthStatus('connected');
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setHealthStatus('error');
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Backend health check failed.',
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <Card
        className="grid gap-6 p-8 md:grid-cols-[1fr_auto]"
        aria-labelledby="app-title"
      >
        <div>
          <p className="mb-2 text-xs font-bold uppercase text-emerald-800">
            Habit Tracker with Streaks
          </p>
          <h1
            className="text-3xl font-bold leading-tight text-slate-950 sm:text-5xl"
            id="app-title"
          >
            Habit Tracker
          </h1>
          <p className="mt-4 max-w-[34rem] text-slate-600">
            Build consistent routines, track today&apos;s progress, and keep
            streaks visible.
          </p>
        </div>

        <div
          className="self-start rounded-lg border border-slate-200 bg-slate-50 p-4"
          role="status"
          aria-live="polite"
        >
          {healthStatus === 'loading' ? (
            <p className="m-0 font-bold text-slate-600">
              Checking backend connection...
            </p>
          ) : null}
          {healthStatus === 'connected' ? (
            <p className="m-0 font-bold text-emerald-700">API connected</p>
          ) : null}
          {healthStatus === 'error' ? (
            <p className="m-0 font-bold text-red-700" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </Card>

      <Card
        className="mt-6 grid items-end gap-4 p-5 md:grid-cols-[1fr_auto]"
        aria-label="Habit controls"
      >
        <Input
          id="habit-search"
          type="search"
          label="Search habits"
          placeholder="Search by name"
          disabled
        />

        <Button disabled>
          Create first habit
        </Button>
      </Card>
    </main>
  );
}

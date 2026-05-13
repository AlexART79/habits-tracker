import { APP_COPY } from './appConstants';

export function AppLoadingScreen(): JSX.Element {
  return (
    <main
      className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white"
      role="status"
      aria-live="polite"
    >
      <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        {APP_COPY.checkingSignIn}
      </p>
    </main>
  );
}

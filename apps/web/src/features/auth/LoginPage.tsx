import { Card } from '../../components/Card';

export function LoginPage(): JSX.Element {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            Habit Tracker with Streaks
          </p>
          <h1 id="login-title" className="mt-2 text-4xl font-bold">
            Sign in
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Continue with your SSO account and return to your habit dashboard.
          </p>
        </div>

        <Card className="w-full p-5" aria-labelledby="login-title">
          <div className="grid gap-3">
          <a
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-2 font-bold text-slate-950 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-emerald-300 dark:border-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            href="/api/auth/google"
          >
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-sm font-black text-blue-600"
              aria-hidden="true"
            >
              G
            </span>
            Continue with Google
          </a>
          <a
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-slate-950 bg-slate-950 px-4 py-2 font-bold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-emerald-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            href="/api/auth/github"
          >
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black text-slate-950"
              aria-hidden="true"
            >
              GH
            </span>
            Continue with GitHub
          </a>
        </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Password sign-in is not supported.
          </p>
        </Card>
      </div>
    </main>
  );
}

import { Card } from '../../components/Card';

export function LoginPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <Card className="w-full p-6" aria-labelledby="login-title">
        <p className="mb-2 text-xs font-bold uppercase text-emerald-800">
          Habit Tracker with Streaks
        </p>
        <h1 id="login-title" className="text-3xl font-bold text-slate-950">
          Sign in
        </h1>
        <p className="mt-3 text-slate-600">
          Use Google or GitHub to continue. Password login is not supported.
        </p>
        <div className="mt-6 grid gap-3">
          <a
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-950 bg-slate-950 px-4 py-2 font-bold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            href="/api/auth/google"
          >
            Continue with Google
          </a>
          <a
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 font-bold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            href="/api/auth/github"
          >
            Continue with GitHub
          </a>
        </div>
      </Card>
    </main>
  );
}

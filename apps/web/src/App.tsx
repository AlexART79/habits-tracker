import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedShell } from './features/auth/ProtectedShell';
import { ThemeProvider } from './features/theme/ThemeProvider';

function AppContent(): JSX.Element {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <main
        className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white"
        role="status"
        aria-live="polite"
      >
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          Checking sign-in status...
        </p>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return <LoginPage />;
  }

  return <ProtectedShell />;
}

export function App(): JSX.Element {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

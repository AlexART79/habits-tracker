import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedShell } from './features/auth/ProtectedShell';

function AppContent(): JSX.Element {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <main
        className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-4 py-10"
        role="status"
        aria-live="polite"
      >
        <p className="font-bold text-slate-700">
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

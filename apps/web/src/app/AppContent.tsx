import { LoginPage } from '../features/auth/LoginPage';
import { ProtectedShell } from '../features/auth/ProtectedShell';
import { useAuth } from '../features/auth/useAuth';
import { AppLoadingScreen } from './AppLoadingScreen';

export function AppContent(): JSX.Element {
  const { status } = useAuth();

  if (status === 'loading') {
    return <AppLoadingScreen />;
  }

  if (status === 'unauthenticated') {
    return <LoginPage />;
  }

  return <ProtectedShell />;
}

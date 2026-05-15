import React, { useState, useEffect } from 'react';
import { useAuth, AuthUser } from '../auth/useAuth';
import { LoginPage } from '../pages/LoginPage';
import { Layout } from './Layout';
import { UserInfo } from './UserInfo';

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  const { user: initialUser, loading } = useAuth();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    if (!loading) {
      setUser(initialUser);
    }
  }, [loading, initialUser]);

  if (loading || user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div role="status" aria-label="Loading" className="text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  if (user === null) {
    return <LoginPage />;
  }

  async function handleLogout() {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  }

  return (
    <Layout
      headerRight={<UserInfo user={user} onLogout={() => void handleLogout()} />}
    >
      {children}
    </Layout>
  );
}

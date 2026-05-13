/* eslint-disable react-refresh/only-export-components */
import type { AuthUserResponse } from '@habit-tracker/shared';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import {
  getCurrentUser,
  logout as logoutFromApi,
} from '../../lib/apiClient';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUserResponse | null;
  errorMessage: string | null;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUserResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshAuth = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await getCurrentUser();
      setUser(response.user);
      setStatus('authenticated');
    } catch {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const logout = useCallback(async () => {
    setErrorMessage(null);

    try {
      await logoutFromApi();
      setUser(null);
      setStatus('unauthenticated');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Logout failed.';
      setErrorMessage(message);
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      errorMessage,
      refreshAuth,
      logout,
    }),
    [errorMessage, logout, refreshAuth, status, user],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return value;
}

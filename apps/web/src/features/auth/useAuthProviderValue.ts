import type { AuthUserResponse } from '@habit-tracker/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, logout as logoutFromApi } from '../../lib/apiClient';
import { AUTH_COPY } from './authConstants';
import type { AuthContextValue, AuthStatus } from './authContext';

export function useAuthProviderValue(): AuthContextValue {
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
      setErrorMessage(error instanceof Error ? error.message : AUTH_COPY.logoutFailed);
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  return useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      errorMessage,
      refreshAuth,
      logout,
    }),
    [errorMessage, logout, refreshAuth, status, user],
  );
}

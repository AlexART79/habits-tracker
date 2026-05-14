import { useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch('/auth/me', { credentials: 'include' })
      .then(async (res) => {
        if (cancelled) return;
        if (res.ok) {
          const user = (await res.json()) as AuthUser;
          if (cancelled) return;
          setState({ user, loading: false, error: null });
        } else if (res.status === 401) {
          setState({ user: null, loading: false, error: null });
        } else {
          const body = await res.json().catch(() => ({}));
          if (cancelled) return;
          setState({
            user: null,
            loading: false,
            error: new Error((body as { message?: string }).message ?? 'Auth error'),
          });
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          user: null,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

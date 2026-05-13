import { createContext } from 'react';
import type { AuthUserResponse } from '@habit-tracker/shared';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthContextValue = {
  status: AuthStatus;
  user: AuthUserResponse | null;
  errorMessage: string | null;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

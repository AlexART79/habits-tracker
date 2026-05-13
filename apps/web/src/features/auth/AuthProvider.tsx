/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import { AuthContext } from './authContext';
import { useAuthProviderValue } from './useAuthProviderValue';

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const value = useAuthProviderValue();

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

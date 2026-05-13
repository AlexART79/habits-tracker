import type { AuthProvider } from './constants.js';

export type HealthResponse = {
  status: 'ok';
  service: 'habit-tracker-api';
  timestamp: string;
};

export type AuthUserResponse = {
  id: string;
  provider: AuthProvider;
  providerUserId: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
};

export type AuthMeResponse = {
  user: AuthUserResponse;
};

export type AuthLogoutResponse = {
  ok: true;
};

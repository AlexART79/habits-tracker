export const AUTH_COPY = {
  brand: 'Habit Tracker with Streaks',
  loginTitle: 'Sign in',
  loginDescription: 'Continue with your SSO account and return to your habit dashboard.',
  googleLabel: 'Continue with Google',
  githubLabel: 'Continue with GitHub',
  passwordUnsupported: 'Password sign-in is not supported.',
  logoutFailed: 'Logout failed.',
  logoutLabel: 'Log out',
  profileFallbackInitial: 'U',
} as const;

export const AUTH_ENDPOINTS = {
  google: '/api/auth/google',
  github: '/api/auth/github',
} as const;

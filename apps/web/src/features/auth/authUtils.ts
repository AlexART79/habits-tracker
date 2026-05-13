import { AUTH_COPY } from './authConstants';

export function getInitials(displayName?: string): string {
  return (
    displayName
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || AUTH_COPY.profileFallbackInitial
  );
}

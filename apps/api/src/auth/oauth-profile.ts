import type { ProviderProfile } from '../users/users.service';

type OAuthProfileEmail = {
  value: string;
};

type OAuthProfilePhoto = {
  value: string;
};

export type GoogleOAuthProfile = {
  id: string;
  displayName?: string;
  emails?: OAuthProfileEmail[];
  photos?: OAuthProfilePhoto[];
};

export type GithubOAuthProfile = {
  id: string;
  username?: string;
  displayName?: string;
  emails?: OAuthProfileEmail[];
  photos?: OAuthProfilePhoto[];
};

export function mapGoogleProfile(profile: GoogleOAuthProfile): ProviderProfile {
  return {
    provider: 'google',
    providerUserId: profile.id,
    email: profile.emails?.[0]?.value ?? null,
    displayName: profile.displayName ?? 'Google user',
    avatarUrl: profile.photos?.[0]?.value ?? null,
  };
}

export function mapGithubProfile(profile: GithubOAuthProfile): ProviderProfile {
  const displayName = profile.displayName ?? profile.username ?? 'GitHub user';

  return {
    provider: 'github',
    providerUserId: profile.id,
    email: profile.emails?.[0]?.value ?? null,
    displayName,
    avatarUrl: profile.photos?.[0]?.value ?? null,
  };
}

import { describe, expect, it } from 'vitest';
import { mapGithubProfile, mapGoogleProfile } from './oauth-profile';

describe('OAuth profile mapping', () => {
  it('maps a Google profile into a provider profile', () => {
    const profile = {
      id: 'google-user-123',
      displayName: 'Ada Lovelace',
      emails: [{ value: 'ada@example.com' }],
      photos: [{ value: 'https://example.com/ada.png' }],
    };

    expect(mapGoogleProfile(profile)).toEqual({
      provider: 'google',
      providerUserId: 'google-user-123',
      email: 'ada@example.com',
      displayName: 'Ada Lovelace',
      avatarUrl: 'https://example.com/ada.png',
    });
  });

  it('maps a Google profile with fallback display name and nullable optional fields', () => {
    const profile = {
      id: 'google-user-fallback',
    };

    expect(mapGoogleProfile(profile)).toEqual({
      provider: 'google',
      providerUserId: 'google-user-fallback',
      email: null,
      displayName: 'Google user',
      avatarUrl: null,
    });
  });

  it('maps a GitHub profile with username fallbacks and nullable optional fields', () => {
    const profile = {
      id: 'github-user-456',
      username: 'octo-ada',
    };

    expect(mapGithubProfile(profile)).toEqual({
      provider: 'github',
      providerUserId: 'github-user-456',
      email: null,
      displayName: 'octo-ada',
      avatarUrl: null,
    });
  });

  it('maps a GitHub profile with a provider fallback display name', () => {
    const profile = {
      id: 'github-user-fallback',
    };

    expect(mapGithubProfile(profile)).toEqual({
      provider: 'github',
      providerUserId: 'github-user-fallback',
      email: null,
      displayName: 'GitHub user',
      avatarUrl: null,
    });
  });
});

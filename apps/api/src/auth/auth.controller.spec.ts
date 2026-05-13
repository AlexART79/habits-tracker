import type { AuthMeResponse } from '@habit-tracker/shared';
import type { Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';
import type { RequestWithSession } from './auth-session';
import type { ProviderProfile } from '../users/users.service';

type RedirectResponse = Pick<Response, 'redirect'>;

function createOAuthRequest(profile: ProviderProfile): RequestWithSession & { user: ProviderProfile } {
  return {
    session: {},
    user: profile,
  } as RequestWithSession & { user: ProviderProfile };
}

function createAuthServiceStub(): Pick<AuthService, 'login' | 'assertTestLoginAllowed' | 'getCurrentUser' | 'logout'> {
  return {
    login: vi.fn<AuthService['login']>(),
    assertTestLoginAllowed: vi.fn(),
    getCurrentUser: vi.fn<AuthService['getCurrentUser']>(),
    logout: vi.fn<AuthService['logout']>(),
  };
}

describe('AuthController OAuth callbacks', () => {
  const profile: ProviderProfile = {
    provider: 'google',
    providerUserId: 'google-123',
    email: 'person@example.com',
    displayName: 'Google Person',
    avatarUrl: null,
  };
  const authResponse: AuthMeResponse = {
    user: {
      id: 'user-1',
      provider: 'google',
      providerUserId: profile.providerUserId,
      email: profile.email,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    },
  };
  const previousSuccessUrl = process.env.WEB_AUTH_SUCCESS_URL;
  let authService: Pick<AuthService, 'login' | 'assertTestLoginAllowed' | 'getCurrentUser' | 'logout'>;
  let controller: AuthController;
  let response: RedirectResponse;

  function restoreWebAuthSuccessUrl(): void {
    if (previousSuccessUrl === undefined) {
      delete process.env.WEB_AUTH_SUCCESS_URL;
    } else {
      process.env.WEB_AUTH_SUCCESS_URL = previousSuccessUrl;
    }
  }

  beforeEach(() => {
    restoreWebAuthSuccessUrl();
    authService = createAuthServiceStub();
    vi.mocked(authService.login).mockResolvedValue(authResponse);
    controller = new AuthController(authService as AuthService);
    response = {
      redirect: vi.fn(),
    };
  });

  afterEach(() => {
    restoreWebAuthSuccessUrl();
  });

  it('logs in a Google provider profile and redirects to the local web app by default', async () => {
    const request = createOAuthRequest(profile);

    await controller.googleCallback(request, response as Response);

    expect(authService.login).toHaveBeenCalledWith(request, profile);
    expect(response.redirect).toHaveBeenCalledWith('http://localhost:5174/');
  });

  it('logs in a GitHub provider profile and redirects to WEB_AUTH_SUCCESS_URL when configured', async () => {
    process.env.WEB_AUTH_SUCCESS_URL = 'http://localhost:5174/welcome';
    const githubProfile: ProviderProfile = {
      provider: 'github',
      providerUserId: 'github-123',
      email: null,
      displayName: 'octo',
      avatarUrl: null,
    };
    const request = createOAuthRequest(githubProfile);

    await controller.githubCallback(request, response as Response);

    expect(authService.login).toHaveBeenCalledWith(request, githubProfile);
    expect(response.redirect).toHaveBeenCalledWith('http://localhost:5174/welcome');
  });
});

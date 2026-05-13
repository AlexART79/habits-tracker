import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import {
  type GithubOAuthProfile,
  mapGithubProfile,
} from '../oauth-profile';
import type { ProviderProfile } from '../../users/users.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ??
        'http://localhost:3001/api/auth/github/callback',
      scope: ['read:user', 'user:email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GithubOAuthProfile,
  ): ProviderProfile {
    return mapGithubProfile(profile);
  }
}

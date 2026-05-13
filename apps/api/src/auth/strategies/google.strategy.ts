import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import {
  type GoogleOAuthProfile,
  mapGoogleProfile,
} from '../oauth-profile';
import type { ProviderProfile } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ??
        'http://localhost:3001/api/auth/google/callback',
      scope: ['profile', 'email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GoogleOAuthProfile,
  ): ProviderProfile {
    return mapGoogleProfile(profile);
  }
}

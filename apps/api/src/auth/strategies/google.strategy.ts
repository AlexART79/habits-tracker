import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

interface GoogleStrategyConfig {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    config?: GoogleStrategyConfig,
  ) {
    super(
      config ?? {
        clientID: process.env['GOOGLE_CLIENT_ID'] ?? '',
        clientSecret: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
        callbackURL: process.env['GOOGLE_CALLBACK_URL'] ?? 'http://localhost:3002/auth/google/callback',
        scope: ['email', 'profile'],
      },
    );
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: Error | null, user?: Express.User) => void,
  ): Promise<void> {
    try {
      const user = await this.authService.upsertUser({
        provider: 'google',
        providerUserId: profile.id,
        email: profile.emails?.[0]?.value ?? null,
        displayName: profile.displayName ?? null,
        avatarUrl: profile.photos?.[0]?.value ?? null,
      });
      done(null, user);
    } catch (err) {
      done(err as Error);
    }
  }
}

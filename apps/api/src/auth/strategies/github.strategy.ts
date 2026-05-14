import { Injectable, Optional } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { AuthService } from '../auth.service';

interface GitHubStrategyConfig {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly authService: AuthService,
    @Optional() config?: GitHubStrategyConfig,
  ) {
    super(
      config ?? {
        clientID: process.env['GITHUB_CLIENT_ID'] ?? 'placeholder',
        clientSecret: process.env['GITHUB_CLIENT_SECRET'] ?? 'placeholder',
        callbackURL:
          process.env['GITHUB_CALLBACK_URL'] ?? 'http://localhost:3002/auth/github/callback',
        scope: ['user:email'],
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
        provider: 'github',
        providerUserId: profile.id,
        email: profile.emails?.[0]?.value ?? null,
        displayName: profile.displayName ?? (profile as any).username ?? null,
        avatarUrl: profile.photos?.[0]?.value ?? null,
      });
      done(null, user);
    } catch (err) {
      done(err as Error);
    }
  }
}

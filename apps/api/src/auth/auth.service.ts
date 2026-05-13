import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AUTH_PROVIDERS, type AuthMeResponse, type AuthProvider, type AuthUserResponse } from '@habit-tracker/shared';
import type { User } from '@prisma/client';
import type { ProviderProfile } from '../users/users.service';
import type { RequestWithSession } from './auth-session';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  async login(request: RequestWithSession, profile: ProviderProfile): Promise<AuthMeResponse> {
    const user = await this.usersService.findOrCreateFromProviderProfile(profile);

    request.session.user = { id: user.id };
    await this.saveSession(request);

    return { user: this.toAuthUser(user) };
  }

  async getCurrentUser(userId: string): Promise<AuthMeResponse> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return { user: this.toAuthUser(user) };
  }

  async logout(request: RequestWithSession): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      request.session.destroy((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  assertTestLoginAllowed(): void {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      throw new NotFoundException('Test login is not available.');
    }
  }

  toAuthUser(user: User): AuthUserResponse {
    return {
      id: user.id,
      provider: this.toAuthProvider(user.provider),
      providerUserId: user.providerUserId,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    };
  }

  private async saveSession(request: RequestWithSession): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      request.session.save((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  private toAuthProvider(provider: string): AuthProvider {
    const authProvider = AUTH_PROVIDERS.find((candidate) => candidate === provider);

    if (authProvider) {
      return authProvider;
    }

    throw new NotFoundException('User not found.');
  }
}

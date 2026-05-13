import { Inject, Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type ProviderProfile = {
  provider: string;
  providerUserId: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
};

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findOrCreateFromProviderProfile(profile: ProviderProfile): Promise<User> {
    return this.prisma.user.upsert({
      where: {
        provider_providerUserId: {
          provider: profile.provider,
          providerUserId: profile.providerUserId,
        },
      },
      create: {
        provider: profile.provider,
        providerUserId: profile.providerUserId,
        email: profile.email,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      },
      update: {
        email: profile.email,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

export interface UpsertUserParams {
  provider: string;
  providerUserId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertUser(params: UpsertUserParams): Promise<User> {
    const { provider, providerUserId, email, displayName, avatarUrl } = params;
    return this.prisma.user.upsert({
      where: { provider_providerUserId: { provider, providerUserId } },
      create: { provider, providerUserId, email, displayName, avatarUrl },
      update: { email, displayName, avatarUrl },
    });
  }
}

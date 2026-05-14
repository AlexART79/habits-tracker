import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  serializeUser(user: User, done: (err: Error | null, id: string) => void): void {
    done(null, user.id);
  }

  async deserializeUser(
    id: string,
    done: (err: Error | null, user: User | false | null) => void,
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      done(null, user ?? false);
    } catch (err) {
      done(err as Error, null);
    }
  }
}

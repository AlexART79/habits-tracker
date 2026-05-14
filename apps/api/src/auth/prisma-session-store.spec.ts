import { PrismaClient } from '@prisma/client';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import type { SessionData } from 'express-session';
import { cleanDatabase } from '../../test/database';
import { PrismaSessionStore } from './prisma-session-store';

describe('PrismaSessionStore', () => {
  const prisma = new PrismaClient();

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('loads a session after a new store instance is created', async () => {
    const sessionId = 'persisted-session-id';
    const firstStore = new PrismaSessionStore(prisma);
    const secondStore = new PrismaSessionStore(prisma);
    const session = {
      cookie: { originalMaxAge: null },
      user: { id: 'user-after-restart' },
    } as SessionData;

    await new Promise<void>((resolve, reject) => {
      firstStore.set(sessionId, session, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    const restored = await new Promise<SessionData | null | undefined>((resolve, reject) => {
      secondStore.get(sessionId, (error, storedSession) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(storedSession);
      });
    });

    expect(restored).toMatchObject({
      user: { id: 'user-after-restart' },
    });
  });
});

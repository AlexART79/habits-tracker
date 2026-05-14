import type { PrismaClient } from '@prisma/client';
import session, { type SessionData } from 'express-session';

type StoreCallback = (error?: unknown) => void;
type StoreSessionCallback = (
  error: unknown,
  session?: SessionData | null,
) => void;

const DEFAULT_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getExpiresAt(sessionData: SessionData): Date {
  const cookieExpires = sessionData.cookie.expires;

  if (cookieExpires instanceof Date) {
    return cookieExpires;
  }

  if (typeof cookieExpires === 'string') {
    return new Date(cookieExpires);
  }

  return new Date(Date.now() + DEFAULT_SESSION_TTL_MS);
}

export class PrismaSessionStore extends session.Store {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  override get(sessionId: string, callback: StoreSessionCallback): void {
    void this.prisma.session
      .findUnique({ where: { id: sessionId } })
      .then(async (storedSession) => {
        if (!storedSession) {
          callback(null, null);
          return;
        }

        if (storedSession.expiresAt <= new Date()) {
          await this.destroySession(sessionId);
          callback(null, null);
          return;
        }

        callback(null, JSON.parse(storedSession.data) as SessionData);
      })
      .catch((error: unknown) => callback(error));
  }

  override set(
    sessionId: string,
    sessionData: SessionData,
    callback?: StoreCallback,
  ): void {
    void this.prisma.session
      .upsert({
        where: { id: sessionId },
        create: {
          id: sessionId,
          data: JSON.stringify(sessionData),
          expiresAt: getExpiresAt(sessionData),
        },
        update: {
          data: JSON.stringify(sessionData),
          expiresAt: getExpiresAt(sessionData),
        },
      })
      .then(() => callback?.())
      .catch((error: unknown) => callback?.(error));
  }

  override destroy(sessionId: string, callback?: StoreCallback): void {
    void this.destroySession(sessionId)
      .then(() => callback?.())
      .catch((error: unknown) => callback?.(error));
  }

  private async destroySession(sessionId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { id: sessionId } });
  }
}

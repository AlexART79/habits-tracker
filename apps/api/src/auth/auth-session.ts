import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { Session, SessionData } from 'express-session';

type SessionUser = {
  id: string;
};

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}

export type RequestWithSession = Request & {
  session: Session & Partial<SessionData> & {
    user?: SessionUser;
  };
};

export function requireSessionUserId(request: RequestWithSession): string {
  const userId = request.session.user?.id;

  if (!userId) {
    throw new UnauthorizedException('Authentication required.');
  }

  return userId;
}

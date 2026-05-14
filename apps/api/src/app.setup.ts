import { ValidationPipe, type INestApplication } from '@nestjs/common';
import session from 'express-session';
import type { RequestHandler } from 'express';

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET is required in production.');
  }

  return 'dev-only-change-me';
}

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5174',
    credentials: true,
  });
  app.use(getSessionMiddleware());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}

let sessionMiddleware: RequestHandler | null = null;

export function getSessionMiddleware(): RequestHandler {
  sessionMiddleware ??=
    session({
      name: 'habit_tracker_session',
      secret: getSessionSecret(),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    });

  return sessionMiddleware;
}

import { Module } from '@nestjs/common';
import session = require('express-session');
import connectSqlite3 from 'connect-sqlite3';
import type { RequestHandler } from 'express';

export const SESSION_MIDDLEWARE = 'SESSION_MIDDLEWARE';

const SQLiteStore = connectSqlite3(session);

@Module({
  providers: [
    {
      provide: SESSION_MIDDLEWARE,
      useFactory: (): RequestHandler =>
        session({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          store: new SQLiteStore({ db: 'sessions.db', dir: './prisma' }) as any,
          secret: process.env['SESSION_SECRET'] ?? 'dev-secret-change-in-production',
          resave: false,
          saveUninitialized: false,
          cookie: {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
          },
        }),
    },
  ],
  exports: [SESSION_MIDDLEWARE],
})
export class SessionConfigModule {}

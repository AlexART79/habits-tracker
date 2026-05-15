import './config/load-env-runtime';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import session = require('express-session');
import passport = require('passport');
import connectSqlite3 from 'connect-sqlite3';

const SQLiteStore = connectSqlite3(session);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
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
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env['PORT'] ?? 3002);
  console.log(`API running on http://localhost:${process.env['PORT'] ?? 3002}`);
}
bootstrap();

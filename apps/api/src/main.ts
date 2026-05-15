import './config/load-env-runtime';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import { SESSION_MIDDLEWARE } from './config/session.config';
import passport = require('passport');
import type { RequestHandler } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useWebSocketAdapter(new WsAdapter(app));

  const sessionMiddleware = app.get<RequestHandler>(SESSION_MIDDLEWARE);
  app.use(sessionMiddleware);
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

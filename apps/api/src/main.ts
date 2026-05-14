import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { configureApp } from './app.setup';
import { AppModule } from './app.module';
import { NotificationsWebSocketServer } from './notifications/notifications-websocket.server';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  app.get(NotificationsWebSocketServer).attach(app.getHttpServer());
}

void bootstrap();

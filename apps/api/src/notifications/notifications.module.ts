import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsService } from './notifications.service';
import { NotificationsWebSocketServer } from './notifications-websocket.server';

@Module({
  imports: [PrismaModule],
  providers: [NotificationsService, NotificationsWebSocketServer],
  exports: [NotificationsWebSocketServer],
})
export class NotificationsModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionConfigModule } from '../config/session.config';
import { NotificationsGateway } from './notifications.gateway';
import { MilestoneService } from './milestone.service';

@Module({
  imports: [PrismaModule, SessionConfigModule],
  providers: [NotificationsGateway, MilestoneService],
  exports: [NotificationsGateway, MilestoneService],
})
export class NotificationsModule {}

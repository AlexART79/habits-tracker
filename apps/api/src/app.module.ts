import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HabitsModule } from './habits/habits.module';
import { CheckInsModule } from './check-ins/check-ins.module';
import { SessionConfigModule } from './config/session.config';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    SessionConfigModule,
    PrismaModule,
    AuthModule,
    HabitsModule,
    CheckInsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
